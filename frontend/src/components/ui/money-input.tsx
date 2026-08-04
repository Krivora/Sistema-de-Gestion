import * as React from "react"
import { Input } from "@/components/ui/input"
import { formatMoneyInput, onlyDecimals, unmaskMoney } from "@/lib/input-helpers"

type Props = Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  /** Valor crudo, siempre parseable con Number(): "18000.5" */
  value: string
  /** Recibe el valor crudo, sin separadores de miles */
  onValueChange: (value: string) => void
}

/**
 * Input de dinero con máscara al perder el foco.
 *
 * Mientras se escribe muestra el valor crudo — así el cursor no salta y se
 * puede borrar libremente. Al salir del campo muestra "18,000.50".
 * El estado del padre siempre guarda el número sin formato.
 */
function MoneyInput({ value, onValueChange, onFocus, onBlur, className, ...props }: Props) {
  const [focused, setFocused] = React.useState(false)

  return (
    <Input
      {...props}
      inputMode="decimal"
      className={className}
      value={focused ? value : formatMoneyInput(value)}
      onChange={(e) => onValueChange(onlyDecimals(unmaskMoney(e.target.value)))}
      onFocus={(e) => {
        setFocused(true)
        e.target.select()
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        // "18000." o ".5" -> número válido; vacío se respeta para poder borrar
        const n = Number(value)
        if (value !== "" && Number.isFinite(n)) onValueChange(String(n))
        onBlur?.(e)
      }}
    />
  )
}

export { MoneyInput }
