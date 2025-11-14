'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { seedFirebase } from '@/lib/firebase/seed'

export function FirebaseSeedButton() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleSeed = async () => {
    setIsSeeding(true)
    setResult('')
    
    try {
      await seedFirebase()
      setResult('✓ Firebase seeded successfully!')
    } catch (error) {
      setResult(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleSeed} 
        disabled={isSeeding}
        variant="outline"
        size="sm"
      >
        {isSeeding ? 'Seeding...' : 'Seed Firebase'}
      </Button>
      {result && (
        <p className={`text-xs ${
          result.startsWith('✓') ? 'text-green-500' : 'text-red-500'
        }`}>
          {result}
        </p>
      )}
    </div>
  )
}
