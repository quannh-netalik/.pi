# Confluence storage format

<!-- Confluence Cloud storage format (XHTML). CLI-independent. Verified 2026-10-21.
     Update only when a snippet fails to render. -->

`page create/update --body <file>` takes this format only: no Markdown, no wiki
markup, no ADF. Best source of truth is a real page:
`atlassian-cli confluence page get <ID> --body-only` prints its raw storage XHTML.
When editing, copy existing macro markup instead of rewriting it.

## Basics

- Well-formed XHTML: every tag closed, void tags self-closed (`<br/>`, `<hr/>`).
- Text blocks: `<p>`, `<h1>`–`<h6>`, `<ul>/<ol><li>`, `<strong>`, `<em>`, `<code>`,
  `<a href="https://…">`, `<blockquote>`.
- Escape `&`, `<`, `>` as `&amp;`, `&lt;`, `&gt;` in text and attributes,
  except inside CDATA.

## Code block

```xml
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">python</ac:parameter>
  <ac:parameter ac:name="title">x.py</ac:parameter>
  <ac:plain-text-body><![CDATA[if a < b and c & d: pass]]></ac:plain-text-body>
</ac:structured-macro>
```

## Panels: `info`, `note`, `warning`, `tip`

```xml
<ac:structured-macro ac:name="warning">
  <ac:parameter ac:name="title">Heads up</ac:parameter>
  <ac:rich-text-body><p>Text</p></ac:rich-text-body>
</ac:structured-macro>
```

## Table

```xml
<table><tbody>
  <tr><th><p>Key</p></th><th><p>Value</p></th></tr>
  <tr><td><p>a</p></td><td><p>1</p></td></tr>
</tbody></table>
```

## Link to a page

```xml
<ac:link>
  <ri:page ri:space-key="MFS" ri:content-title="Exact Title"/>
  <ac:plain-text-link-body><![CDATA[label]]></ac:plain-text-link-body>
</ac:link>
```

Omit `ri:space-key` for a page in the same space. It takes the space KEY
(`MFS`, or `~…` for personal spaces), not the numeric ID that `--space` takes.

## Attachment link and image

```xml
<ac:link><ri:attachment ri:filename="report.pdf"/></ac:link>
<ac:image ac:width="600"><ri:attachment ri:filename="diagram.png"/></ac:image>
```

## User mention

```xml
<ac:link><ri:user ri:account-id="5f1a…"/></ac:link>
```

Account ID only (no username/email):
`atlassian-cli jira api /rest/api/3/user/search --query query=<name or email>`.

## Status lozenge

```xml
<ac:structured-macro ac:name="status">
  <ac:parameter ac:name="colour">Green</ac:parameter>
  <ac:parameter ac:name="title">DONE</ac:parameter>
</ac:structured-macro>
```

Colours: Grey, Red, Yellow, Green, Blue, Purple.

## Table of contents

```xml
<ac:structured-macro ac:name="toc"><ac:parameter ac:name="maxLevel">3</ac:parameter></ac:structured-macro>
```

## Expand

```xml
<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Details</ac:parameter>
  <ac:rich-text-body><p>…</p></ac:rich-text-body>
</ac:structured-macro>
```

## Jira issue

```xml
<ac:structured-macro ac:name="jira"><ac:parameter ac:name="key">ABC-123</ac:parameter></ac:structured-macro>
```

If it does not render, copy the `server` and `serverId` parameters from an
existing page that embeds a Jira issue.

## Task list

```xml
<ac:task-list>
  <ac:task><ac:task-status>incomplete</ac:task-status><ac:task-body>Do X</ac:task-body></ac:task>
</ac:task-list>
```

## Common mistakes

1. Unescaped `&`, `<`, `>` outside CDATA.
2. Unclosed void tags: `<br>` instead of `<br/>`, `<ri:page …>` without `/>`.
3. CDATA outside `ac:plain-text-body` / `ac:plain-text-link-body`. A literal
   `]]>` inside code must be split: `]]]]><![CDATA[>`.
4. `ri:space-key` given the numeric space ID.
5. Rich content in `ac:plain-text-body` or plain text in `ac:rich-text-body`.
6. Markdown pasted into the body file: it is published as literal text.
