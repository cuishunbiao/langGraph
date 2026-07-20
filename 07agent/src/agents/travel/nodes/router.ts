import type { T_travelSchema } from "../../../states/index.ts";

export function router(state: T_travelSchema) {
    const intent = state.intent;
    if (intent === 'weather') return 'weather'
    else if (intent === 'ticket') return 'ticket'
    return 'chat'
}
