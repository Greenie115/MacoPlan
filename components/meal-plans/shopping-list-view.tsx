'use client'

/**
 * Shopping List View Component (MVP)
 *
 * Displays shopping list with PDF and CSV export
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { exportShoppingListCSV } from '@/app/actions/shopping-lists'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ShoppingList, CategorizedIngredients, ShoppingListIngredient } from '@/lib/types/database'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// Initialize pdfMake fonts
// Note: pdfFonts structure is not correctly typed, using type assertion
if (typeof window !== 'undefined') {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs
}

interface ShoppingListViewProps {
  shoppingList: ShoppingList
  mealPlanId: string
}

export default function ShoppingListView({ shoppingList, mealPlanId }: ShoppingListViewProps) {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)

  const ingredients = shoppingList.ingredients as CategorizedIngredients

  const categoryNames: Record<keyof CategorizedIngredients, string> = {
    produce: '🥬 Produce',
    dairy: '🥛 Dairy',
    meat: '🥩 Meat & Seafood',
    pantry: '🥫 Pantry',
    bakery: '🍞 Bakery',
    frozen: '🧊 Frozen',
    other: '📦 Other',
  }

  async function handleExportCSV() {
    setIsExporting(true)
    try {
      const result = await exportShoppingListCSV(shoppingList.id)

      if (result.success && result.data) {
        // Download CSV
        const blob = new Blob([result.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export CSV error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  function handleExportPDF() {
    setIsExporting(true)
    try {
      const content: any[] = [
        { text: 'Shopping List', style: 'header' },
        { text: shoppingList.name, style: 'subheader' },
        { text: `${new Date(shoppingList.start_date).toLocaleDateString()} - ${new Date(shoppingList.end_date).toLocaleDateString()}`, style: 'date' },
        { text: ' ' },
      ]

      // Add each category
      Object.entries(ingredients).forEach(([category, items]) => {
        if (items.length > 0) {
          const categoryName = categoryNames[category as keyof CategorizedIngredients]
          content.push({
            text: categoryName,
            style: 'categoryHeader',
          })

          const itemsList = items.map((item: ShoppingListIngredient) => {
            const amount = item.amount ? `${item.amount}` : ''
            const unit = item.unit || ''
            return `☐ ${amount} ${unit} ${item.name}`.trim()
          })

          content.push({
            ul: itemsList,
            style: 'list',
          })

          content.push({ text: ' ' })
        }
      })

      const docDefinition: any = {
        content,
        styles: {
          header: {
            fontSize: 24,
            bold: true,
            marginBottom: 10,
          },
          subheader: {
            fontSize: 16,
            marginBottom: 5,
          },
          date: {
            fontSize: 10,
            color: '#666',
            marginBottom: 20,
          },
          categoryHeader: {
            fontSize: 14,
            bold: true,
            marginTop: 10,
            marginBottom: 5,
          },
          list: {
            marginLeft: 20,
          },
        },
      }

      pdfMake.createPdf(docDefinition).download(`shopping-list-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Export PDF error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Count total items
  const totalItems = Object.values(ingredients).reduce((sum, items) => sum + items.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/meal-plans/${mealPlanId}`)}
            className="mb-2 px-0"
          >
            ← Back to Meal Plan
          </Button>
          <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
          <p className="text-muted-foreground">{shoppingList.name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(shoppingList.start_date).toLocaleDateString()} - {new Date(shoppingList.end_date).toLocaleDateString()} • {totalItems} items
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="default"
          >
            {isExporting ? 'Exporting...' : '📄 Export PDF'}
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            variant="outline"
          >
            {isExporting ? 'Exporting...' : '📊 Export CSV'}
          </Button>
        </div>
      </div>

      {/* Shopping List Categories */}
      <div className="space-y-4">
        {Object.entries(ingredients).map(([category, items]) => {
          if (items.length === 0) return null

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{categoryNames[category as keyof CategorizedIngredients]}</CardTitle>
                <CardDescription>{items.length} items</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {items.map((item: ShoppingListIngredient) => {
                    const amount = item.amount ? `${item.amount}` : ''
                    const unit = item.unit || ''
                    const displayText = `${amount} ${unit} ${item.name}`.trim()

                    return (
                      <li key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <div className="w-5 h-5 border-2 rounded flex-shrink-0" />
                        <span className="flex-1">{displayText}</span>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
