import * as assert from "assert";
import * as path from "path";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import {Configuration, OpenAIApi} from "openai";
import * as api from "../src/components/api.mjs"
import fs from "fs/promises"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('OpenAI', function () {
    describe('#test()', function () {
        it('Should be able to invoke the AI', async function () {
            this.timeout(5 * 1000);
            async function test(){
                const configuration = new Configuration({
                    apiKey: process.env.OPENAI_API_KEY,
                });
                const openai = new OpenAIApi(configuration);
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: "Say this is a test",
                    temperature: 0,
                    max_tokens: 7,
                });
                return response;
            }
            let response = await test();
            assert.equal(response.data.choices[0].text, "\n\nThis is indeed a test");
        });
        it('Should be able to invoke the AI in batch', async function () {
            this.timeout(20 * 1000);
            let topics = [
                "Babor creame", "Babor makup", "Babor HSR Lifting"
            ]
            let gelegenheiten = [
                "Dating", "Fine Dinner", "Wedding"
            ]
            let template = `Make me a 150 word sentence about beauty, convincing me to buy the product {{topic}}. Please give me the output text in German. Tell me why it is the for {{gelegenheit}}`
            let allResponses = await Promise.all(topics.map(topic => {
                let prompt = template.replaceAll("{{topic}}", topic);
                return api.prompt({
                    prompt
                });
            }))
            let fileContent = JSON.stringify(allResponses.map(r => r.data), null, 4)
            await fs.writeFile(path.resolve(`${__dirname}/../database/responses.json`), fileContent, err => {
                if (err) {
                    console.error(err);
                }
                // file written successfully
                return true;
            });
        });
    });
});