import weather from './weather.ts'
import calculator from './calculator.ts'

const tools = [weather, calculator]

export type ToolList = typeof tools;
export default tools;
