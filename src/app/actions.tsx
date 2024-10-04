// "use server";

// import { createAI, getMutableAIState, streamUI } from "ai/rsc";
// import { generateText, type CoreMessage, type ToolInvocation } from 'ai';
// import type { ReactNode } from "react";
// import { BotCard, BotMessage } from "@/components/llm/message";
// import { openai } from '@ai-sdk/openai';
// import { Loader2 } from "lucide-react";
// import { symbol, z } from "zod";
// import { MainClient } from 'binance';
// import { env } from "@/env";
// import { sleep } from "@/lib/utils";
// import { Price } from "@/components/llm/price";
// import { PriceSkeleton } from "@/components/llm/price-skeleton";
// import Markdown from 'react-markdown'
// import { Stats } from "@/components/llm/stats";


// const binance = new MainClient({
//     api_key: env.BINANCE_API_KEY,
//     api_secret: env.BINANCE_API_SECRET,
// })
// //This is the system message we send to the llm to instantiate it 
// // This gives the Llm, the context for the tool calling  
// const content = `\
// You are a crypto bot and you can help users get the prices of cryptocurrencies.

// Messages inside [] means that it's a UI element or a user event. For example:
// - "[Price of BTC = 69000]" means that the interface of the cryptocurrency price of BTC is shown to the user.

// If the user wants the price, call \`get_crypto_price\` to show the price.
// If the user wants the market cap or other stats of a given cryptocurrency, call \`get_crypto_stats\` to show the stats.
// If the user wants a stock price, it is an impossible task, so you should respond that you are a demo and cannot do that.
// If the user wants to do anything else, it is an impossible task, so you should respond that you are a demo and cannot do that.

// Besides getting prices of cryptocurrencies, you can also chat with users.
// `;

// export const sendMessage = async (message: string ) : Promise<{
//     id: number;
//     role: 'user' | 'assistant';
//     display: ReactNode;
// }> => {

//     const history = getMutableAIState<typeof AI>();

//     history.update([
//         ...history.get(),
//         {
//             role:'user',
//             content: message,

//         },
//     ]);

//     const reply = await streamUI({
//         model: openai('gpt-4o-mini'),
//         messages: [
//             { role: "system",
//                 content,
//                 toolInvocation: []
//             }, ...history.get()
//         ] as CoreMessage[],
//         initial: (
//             <BotMessage className="items-center flex shrink-0 select-none justify-center">
//                 <Loader2 className="w-5 animate-spin stroke-zinc-900" />
//             </BotMessage>
//         ),
//         text: ({content, done}) => {
//             if (done) history.done([...history.get(), { role: "assistant", content}]);
//             // console.log(content)
//             return <BotMessage>{content}</BotMessage>
//         },

//         temperature : 0,
//         tools: { // Record <string, tool>

//             get_crypto_price: {
//                 description: "Get the Current price of a given cryptocurrency. Use this to show the price to the user.",
//                 parameters: z.object({
//                     symbol: z.string().describe("The symbol of the cryptocurrency. e.g. BTC/SOL/ETH ")
//                 }),
//                 generate: async function* ({symbol}: {symbol: string}) {
                    
                  
                    
//                     yield 
//                         <BotCard>
//                        <PriceSkeleton />
//                         </BotCard>;
                    
//                     const stats = await binance.get24hrChangeStatististics({symbol: `${symbol}USDT`});
                    
//                     const price = Number(stats.lastPrice);

//                     const delta = Number(stats.priceChange);

//                     await sleep(1000);

//                     history.done([
//                         ...history.get(),
//                         {role: 'assistant', name: "get_crypto_price", content: `[Price of ${symbol} = ${price}]`}
//                     ])


//                     return <BotCard showAvatar={true}><Price price={price} delta={delta} symbol={symbol} /></BotCard>;
//                 }
//             },
//             get_crypto_stats: {
//                 description: "Get the market stats of a given cryptocurrecy. Use this to show the stats to the user.",
//                 parameters: z.object({
//                     slug:z.string().describe("The name of the cryptocurreny in lowercase. e.g. bitcoin/solana/ethereum ")
//             }),
//             generate: async function* ({slug} : {slug: string}) {
//                 yield (
//                     <BotCard>
//                         Loading...
//                     </BotCard>
//                 )
//                 const url = new URL("https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail");
//                 url.searchParams.append('slug', slug);
//                 url.searchParams.append('limit', '1');
//                 url.searchParams.append('sortBy', 'market_cap');

//                 const respose = await fetch(url, {
//                     headers: {
//                         Accept: 'application/json',
//                         "Content-Type": 'application/json',
//                         "X-CMC_PRO_API_KEY": env.CMC_API_KEY
//                     }
//                 })

//                 if(!respose.ok){
//                     history.done([
//                         ...history.get(),
//                         {role: 'assistant', name: "get_crypto_stats", content: "Crypto not found!",},
//                     ]);
//                 return <BotMessage>{content}</BotMessage>
//                 }

//                 const json = await respose.json() as {
//                     data: {
//                         id: number;
//                         name: string;
//                         symbol: string;
//                         volume: number;
//                         volumeChangePercentage24h: number;
//                         statistics: {
//                             rank: number;
//                             totalSupply: number;
//                             marketCap: number;
//                             marketCapDominance: number;
//                         }
//                     },

                    
//                 }
//                 const data = json.data;
//                 const stats = json.data.statistics;

//                 const marketSats = {
//                     name: data.name,
//                     volume: data.volume,
//                     volumeChangePercentage24h: data.volumeChangePercentage24h,
//                     rank: stats.rank,
//                     marketCap: stats.marketCap,
//                     totalSupply: stats.totalSupply,
//                     dominance: stats.marketCapDominance,

//                 };

//                 await sleep(1000);

//                     history.done([
//                         ...history.get(),
//                         {role: 'assistant', name: "get_crypto_stats", content: `[Stats of ${data.symbol}]`}
//                     ]);

//                      // Step 4: Send the stats to OpenAI for summarization
//     const prompt = `This is the stats of the coin "${data.name}". Please summarize and give information about these stats:\n${JSON.stringify(marketSats, null, 2)}`;

//     const aiResponse = await generateText({
//         model: openai('gpt-4o-mini'),
//         prompt,
        
//     });
                
                    
//                 // return(
//                 //     <BotCard>
//                 //        {<pre>{JSON.stringify(marketSats, null, 2)}</pre>}
//                 //     </BotCard>
                  
//                 // );
//                 const aiResponseText = aiResponse.text;
//                 return (
//                     <>
//                         <BotCard>
//                             <Stats {...marketSats}/>
//                         </BotCard>
//                         <BotMessage>
//                             <Markdown>
//                             {aiResponseText}
//                             </Markdown>
//                         </BotMessage>
//                     </>
//                 );
            

//             }

            

//             },
           

//         }
//     })

//     return {
//         id: Date.now(),
//         role: 'assistant',
//         display: reply.value,
//     }
// };



// export type AIState = Array<{
//     id?: number;
//     name?: "get_crypto_price" | "get_crypto_stats";
//     role: 'user' | 'assistant' | "system";
//     content: string;
// }>

// export type UIState = Array<{
//     id: number;
//     role: 'user' | 'assistant';
//     display: ReactNode;
//     toolInvocations?: ToolInvocation[];
// }>


// export const AI = createAI({
//     initialAIState: [] as AIState,
//     initialUIState: [] as UIState,
//     actions: {
//         sendMessage,
//     }
// })

"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { generateText, type CoreMessage, type ToolInvocation } from 'ai';
import type { ReactNode } from "react";
import { BotCard, BotMessage } from "@/components/llm/message";
import { openai } from '@ai-sdk/openai';
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { MainClient } from 'binance';
import { env } from "@/env";
import { sleep } from "@/lib/utils";
import { Price } from "@/components/llm/price";
import { PriceSkeleton } from "@/components/llm/price-skeleton";
import Markdown from 'react-markdown';
import { Stats } from "@/components/llm/stats";

const binance = new MainClient({
  api_key: env.BINANCE_API_KEY,
  api_secret: env.BINANCE_API_SECRET,
});

const content = `
You are a crypto bot that helps users get prices and stats of cryptocurrencies.

- Messages inside square brackets [] represent UI elements or user events. For example:
  - "[Price of BTC = 69000]" means the interface showing the price of BTC is displayed to the user.
  - "[Stats of BTC]" means the interface showing the stats of BTC is displayed to the user.

Instructions:

- **If the user asks for both the price and stats of a cryptocurrency in one message**, you should call both \`get_crypto_price\` and \`get_crypto_stats\` in the appropriate order.
- **If the user wants the price**, call \`get_crypto_price\` to show the price.
- **If the user wants the market cap or other stats**, call \`get_crypto_stats\` to show the stats.
- **If the user wants a stock price or anything else**, respond that you are a crypto bot and cannot assist with that.
- **Besides getting prices and stats**, you can also chat with users.

Remember to format your responses appropriately and only use the tools when necessary.
`;


export const sendMessage = async (message: string): Promise<{
  id: number;
  role: 'user' | 'assistant';
  display: ReactNode;
}> => {
  const history = getMutableAIState<typeof AI>();

  // Update history with the user's message
  history.update([
    ...history.get(),
    {
      role: 'user',
      content: message,
    },
  ]);

  // Call streamUI without updating history inside handlers
  const reply = await streamUI({
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: "system",
        content,
        toolInvocation: [],
      },
      ...history.get(),
    ] as CoreMessage[],
    initial: (
      <BotMessage className="items-center flex shrink-0 select-none justify-center">
        <Loader2 className="w-5 animate-spin stroke-zinc-900" />
      </BotMessage>
    ),
    text: ({ content }) => {
      // Do not update history here
      return <BotMessage>{content}</BotMessage>;
    },
    temperature: 0,
    tools: {
      get_crypto_price: {
        description: "Get the current price of a given cryptocurrency. Use this to show the price to the user.",
        parameters: z.object({
          symbol: z.string().describe("The symbol of the cryptocurrency. e.g., BTC/SOL/ETH"),
        }),
        generate: async function* (
          { symbol }: { symbol: string },
          context: { toolName: string; toolCallId: string }
        ): AsyncGenerator<ReactNode, ReactNode, void> {
          // Do not update history here
          yield (
            <BotCard>
              <PriceSkeleton />
            </BotCard>
          );

          const stats = await binance.get24hrChangeStatististics({ symbol: `${symbol}USDT` });

          const price = Number(stats.lastPrice);
          const delta = Number(stats.priceChange);

          await sleep(1000);

          const finalUI = (
            <BotCard showAvatar={true}>
              <Price price={price} delta={delta} symbol={symbol} />
            </BotCard>
          );

          yield finalUI;

          // Return the final UI element
          return finalUI;
        },
      },
      get_crypto_stats: {
        description: "Get the market stats of a given cryptocurrency. Use this to show the stats to the user.",
        parameters: z.object({
          slug: z.string().describe("The name of the cryptocurrency in lowercase. e.g., bitcoin/solana/ethereum"),
        }),
        generate: async function* (
          { slug }: { slug: string },
          context: { toolName: string; toolCallId: string }
        ): AsyncGenerator<ReactNode, ReactNode, void> {
          // Do not update history here
          yield (
            <BotCard>
              Loading...
            </BotCard>
          );

          const url = new URL("https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail");
          url.searchParams.append('slug', slug);
          url.searchParams.append('limit', '1');
          url.searchParams.append('sortBy', 'market_cap');

          const response = await fetch(url, {
            headers: {
              Accept: 'application/json',
              "Content-Type": 'application/json',
              "X-CMC_PRO_API_KEY": env.CMC_API_KEY,
            },
          });

          if (!response.ok) {
            const errorMessage = <BotMessage>Crypto not found!</BotMessage>;
            yield errorMessage;
            return errorMessage;
          }

          const json = await response.json() as {
            data: {
              id: number;
              name: string;
              symbol: string;
              volume: number;
              volumeChangePercentage24h: number;
              statistics: {
                rank: number;
                totalSupply: number;
                marketCap: number;
                marketCapDominance: number;
              };
            };
          };

          const data = json.data;
          const stats = json.data.statistics;

          const marketStats = {
            name: data.name,
            volume: data.volume,
            volumeChangePercentage24h: data.volumeChangePercentage24h,
            rank: stats.rank,
            marketCap: stats.marketCap,
            totalSupply: stats.totalSupply,
            dominance: stats.marketCapDominance,
          };

          await sleep(1000);

          // Summarize stats using OpenAI
          const prompt = `This is the stats of the coin "${data.name}". Please summarize and give information about these stats:\n${JSON.stringify(marketStats, null, 2)}`;

          const aiResponse = await generateText({
            model: openai('gpt-4o-mini'),
            prompt,
          });

          const aiResponseText = aiResponse.text;

          const finalUI = (
            <>
              <BotCard>
                <Stats {...marketStats} />
              </BotCard>
              <BotMessage>
                <Markdown>{aiResponseText}</Markdown>
              </BotMessage>
            </>
          );

          yield finalUI;

          // Return the final UI element
          return finalUI;
        },
      },
    },
  });

  // Update history after streamUI completes
  history.done([
    ...history.get(),
    {
      role: 'assistant',
      content: message, // You might want to adjust this to capture the assistant's actual response
    },
  ]);

  return {
    id: Date.now(),
    role: 'assistant',
    display: reply.value,
  };
};

export type AIState = Array<{
  id?: number;
  name?: "get_crypto_price" | "get_crypto_stats";
  role: 'user' | 'assistant' | "system";
  content: string;
}>;

export type UIState = Array<{
  id: number;
  role: 'user' | 'assistant';
  display: ReactNode;
  toolInvocations?: ToolInvocation[];
}>;

export const AI = createAI({
  initialAIState: [] as AIState,
  initialUIState: [] as UIState,
  actions: {
    sendMessage,
  },
});
