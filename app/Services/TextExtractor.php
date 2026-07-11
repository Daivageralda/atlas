<?php

namespace App\Services;

class TextExtractor
{
    public function extractAndTranslate(string $contentType, string $text, callable $translateCallback): string
    {
        return match ($contentType) {
            'html' => $this->handleHtml($text, $translateCallback),
            'markdown' => $this->handleMarkdown($text, $translateCallback),
            default => $translateCallback($text),
        };
    }

    private function handleHtml(string $html, callable $translateCallback): string
    {
        if (empty(trim($html))) {
            return $html;
        }

        $dom = new \DOMDocument();
        // Prevent warning logs during parsing HTML fragments with custom structures
        libxml_use_internal_errors(true);
        // Load with UTF-8 encoding support
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        $textNodes = $xpath->query('//text()');

        foreach ($textNodes as $node) {
            // Ignore whitespaces or scripts/style attributes contents
            if (trim($node->nodeValue) !== '' && $node->parentNode->nodeName !== 'script' && $node->parentNode->nodeName !== 'style') {
                $node->nodeValue = htmlspecialchars($translateCallback($node->nodeValue), ENT_NOQUOTES, 'UTF-8');
            }
        }

        $translatedHtml = $dom->saveHTML();
        // Clean XML header prefix added during loading XML definition
        return str_replace('<?xml encoding="utf-8" ?>', '', $translatedHtml);
    }

    private function handleMarkdown(string $markdown, callable $translateCallback): string
    {
        if (empty(trim($markdown))) {
            return $markdown;
        }

        // V1 simple markdown handling strategy:
        // Use regex pattern split to isolate backtick code blocks and translate block segments
        $pattern = '/(```.*?```|`.*?`)/ms';
        $parts = preg_split($pattern, $markdown, -1, PREG_SPLIT_DELIM_CAPTURE);

        foreach ($parts as &$part) {
            if (!empty($part) && !str_starts_with($part, '`')) {
                // Non-code segment, safe to pass translation model dispatcher
                $part = $translateCallback($part);
            }
        }

        return implode('', $parts);
    }
}
