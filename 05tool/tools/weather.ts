import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";

const schema = z.object({
    location: z.string().min(1).describe("The location to get the weather for"),
    unit: z.enum(["celsius", "fahrenheit"]).describe("The unit of temperature to use"),
})

export type WeatherInput = z.infer<typeof schema>;

const func = ({location, unit = 'celsius'}: WeatherInput) => {
    const weather_info = {
        location,
        temperature: 20,
        unit,
        forecast: "sunny",
    }
    return JSON.stringify(weather_info);
}

const weather = tool(func, {
    name: "weather",
    description: "Get the weather for a given location",
    schema,
})

export default weather