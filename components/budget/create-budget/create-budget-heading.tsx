'use client'

import { Button } from '@/components/ui/button'

interface HeaderProps {
  onDraft: () => void
  // onSave: () => void
  onNew: () => void
}

const CreateBudgetHeading = ({ onDraft,  onNew }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Button variant="outline" size="sm" onClick={onNew}>
          New
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onDraft}>
          Draft
        </Button>
        <Button variant="default" >
          Final Posting
        </Button>
      </div>
    </div>
  )
}

export default CreateBudgetHeading




