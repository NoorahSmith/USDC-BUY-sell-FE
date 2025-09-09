'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

export function ClusterDropdown() {
  // Since we're using devnet, just show a simple button
  return (
    <Button variant="outline" disabled>
      Devnet
    </Button>
  )
}
