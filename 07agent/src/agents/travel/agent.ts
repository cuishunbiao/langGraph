import { StateGraph, START, END } from "@langchain/langgraph";
import { travelSchema } from "../../states/index.ts";
import {
  chat,
  intent,
  response,
  router,
  ticket,
  weather,
} from "./nodes/index.ts";

const graph = new StateGraph(travelSchema)
.addNode("chat", chat)
.addNode("intent_node", intent)
.addNode("response", response)
.addNode("ticket", ticket)
.addNode("weather", weather)
.addEdge(START, 'intent_node')
.addConditionalEdges("intent_node", router)
.addEdge("weather", "response")
.addEdge("ticket", "response")
.addEdge("response", END)
.addEdge("chat", END)
.compile();

export default graph;