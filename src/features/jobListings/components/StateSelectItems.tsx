import { SelectItem } from "@/components/ui/select"
import states from "@/data/states.json"

export function StateSelectItems() {
    return Object.entries(states).map(([abbreviation, name]) => {
        return <SelectItem key={abbreviation} value={abbreviation}>
            {name}
        </SelectItem>
    })
}