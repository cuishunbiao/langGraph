import weather from './weatherTool.ts'
import search from './searchTool.ts'

const tools = [weather, search]

export type ToolList = typeof tools;
export default tools;