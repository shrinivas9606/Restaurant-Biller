// src/components/ui/use-toast.ts
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

type ToastProps = {
  className?: string
  variant?: "default" | "destructive"
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
}

type ToasterToast = ToastProps & {
  id: string
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 3000 // 3 seconds

type State = {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }

let dispatch: (action: Action) => void = () => {}

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    if (dispatch) {
      dispatch({
        type: "DISMISS_TOAST",
        toastId: toastId,
      })
    }
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) addToRemoveQueue(toastId)
      return {
        ...state,
        toasts: state.toasts.filter((t) =>
          toastId ? t.id !== toastId : true
        ),
      }
    }
    default:
      return state
  }
}

// ✅ Export a toast() function for usage
export function toast(props: Omit<ToasterToast, "id">) {
  const id = Math.random().toString(36).slice(2)
  dispatch({ type: "ADD_TOAST", toast: { id, ...props } })
}
