// ==UserScript==
// @name         GPT Tooltip via OpenRouter (Mistral)
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Відправляє виділений текст на OpenRouter API і показує коротку відповідь біля курсору
// @author       ChatGPT
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const OPENROUTER_API_KEY = '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'; // встав сюди свій ключ
    const MODEL = 'openai/gpt-4o'; // інша модель: openai/gpt-3.5-turbo, meta-llama/llama-3-8b-instruct, тощо

    let tooltip;

    document.addEventListener('mouseup', async (e) => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length < 2) return;

        showTooltip("", e.pageX, e.pageY);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://your-site.com/',
                    'X-Title': 'GPT Tooltip Script'
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'user', content: `Сразу Дуже Стисло максимум 8 слів і коротко дай відповідь, але зрозумілу: ${selectedText}` }
                    ],
                    max_tokens: 80,
                })
            });

            const data = await response.json();
            const answer = data?.choices?.[0]?.message?.content || "⚠️";

            showTooltip(answer, e.pageX, e.pageY);
        } catch (err) {
            showTooltip("", e.pageX, e.pageY);
            console.error("GPT error:", err);
        }
    });

    function showTooltip(text, x, y) {
        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.id = "chatgpt-tooltip";
            document.body.appendChild(tooltip);
        }
        tooltip.textContent = text;
        tooltip.style.left = `${x + 12}px`;
        tooltip.style.top = `${y + 12}px`;
        tooltip.style.display = "block";
    }

    GM_addStyle(`
        #chatgpt-tooltip {
            position: absolute;
            background: transparent;                    /* фон повністю прозорий */
            color: rgba(0, 0, 0, 0.08);                   /* дуже прозорий чорний текст */
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 11px;
            max-width: 240px;
            box-shadow: none;
            z-index: 9999;
            display: none;
            white-space: normal;
            line-height: 1.2;
            /* Якщо потрібно, можна додатково додати transition для плавності */
        }
    `);
})();
