"use client"

import { useParams } from 'next/navigation'
import React from 'react'

const Editor = async () => {

    const {projectId} = await useParams()
  return (
    <div>
      Editor: {projectId}
    </div>
  )
}

export default Editor
