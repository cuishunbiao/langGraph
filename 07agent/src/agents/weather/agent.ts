import { StateGraph, START, END } from "@langchain/langgraph";
import { weatherSchema } from "../../states/index.ts";
import { weather_query } from "./nodes.ts";

const graph = new StateGraph(weatherSchema)
.addNode("weather_query", weather_query)
.addEdge(START, "weather_query")
.addEdge("weather_query", END)
.compile();

export default graph;