# [`<code-anatomy/>`](https://ddamato.github.io/code-anatomy/)

[![npm version](https://img.shields.io/npm/v/code-anatomy.svg)](https://www.npmjs.com/package/code-anatomy)

A native web-component which can identify parts of code; expected to be used in documentation pages to annotate.

## Install

The project is distributed as an [`IIFE`](https://developer.mozilla.org/en-US/docs/Glossary/IIFE), so the easiest way is to just create a script tag pointing to the export hosted on [unpkg](https://unpkg.com/).

```html
<script src="unpkg.com/code-anatomy" defer></script>
```

However, you can also install the package and add the script through some build process.

```html
<script src="dist/code-anatomy.iife.js" defer></script>
```

## Usage

Once the script is loaded, you can add the new component to a page.

```html
<code-anatomy language="css">
  body {
    font-family: sans-serif;
  }
</code-anatomy>
```

`html`, `css`, `js` languages are supported.

## Edit Mode

When adding a new component to the page, no indicators will appear. You'll need to update the component with the `edit` attribute in order to allow editing. When in edit mode, you can click parts of the code to create markers and describe the feature in the numbered list that appears.

```html
<code-anatomy language="css" edit>
  body {
    font-family: sans-serif;
  }
</code-anatomy>
```

Once you've completed editing, remove the `edit` attribute and copy the resulting HTML; specifically the data left in the `definitions` attribute. This describes your anatomy to be rendered the same way each time the component is loaded, assuming the content within the tags is the same.

```html
<code-anatomy language="css" definitions="W3sieCI6IjMzJSIsInkiOiI0MCUiLC...">
  body {
    font-family: sans-serif;
  }
</code-anatomy>
```

You can also hit the `Esc` key on your keyboard to exit out of edit mode. This will also copy the resulting HTML to your clipboard, assuming your browser supports `document.execCommand`. Otherwise, you'll just need to view the resulting source code.
## Additional Features

- The markers will become hidden in size when the figure is hovered; reducing the visual obstruction they would cause at normal size.
- You can hover any numbered list item to highlight the corresponding marker. This also occurs in edit mode.
- If you clear the description entirely in edit mode, the marker will be removed.
- You can [create links using markdown syntax](https://www.markdownguide.org/basic-syntax/#links) in the list items. After losing focus, the text will transform into a link. If you attempt to re-edit the link, it'll be lost. No other special formatting is included.

## Manipulating Definitions

The `definitions` attribute value is an encoded JSON string. You can potentially update this yourself through JavaScript. For example, if you are storing the examples in a database or generating your own through some computed process. **Manipulating this way isn't advised** but it is possible.

```js
const anatomy = document.querySelector('code-anatomy');
anatomy.remove(2) // Removes the third item
anatomy.update(0, { term: 'Update the description' }); // Updates the text of the first item
```

Each definition is an object (`{ match, occurrence, term }`). The `match` is the string found in the code to match. `occurrence` identifies which one of those to match within the code. This is useful if there's multiple of the same match found in the sample code. `term` is the description found in the list.

```js
const anatomy = document.querySelector('code-anatomy');
anatomy.create({
  term: 'The description of the marker',
  match: 'font-family',
  occurrence: 0,
});
```

You may also clear all of the definitions with one command.

```js
const anatomy = document.querySelector('code-anatomy');
anatomy.clear(); // Clears all items
```

You can also adjust the `definitions` array directly with varying degrees of freedom.

```js
const anatomy = document.querySelector('code-anatomy');
anatomy.definitions = anatomy.definitions.concat({
  term: 'The description of the marker',
  match: 'body',
  occurrence: 0,
});
```

You must set a new array of `definitions` to re-render. Simply mutating the current array will not cause any changes to occur.

## Attributes

| Name | Description |
| ---- | ----------- |
| `definitions` | An encoded string that is represents the data for the anatomy to be rendered. Allow the component to generate this for you during [Edit Mode](#edit-mode). This can be set using a JavaScript property. (`anatomy.definitions = []`) |
| `edit` | When set, this allows the component to be edited. See [Edit Mode](#edit-mode) for details. This can be set using a JavaScript property (`anatomy.edit = true`). |
| `language` | Determines how [`Prism`](https://prismjs.com/) should highlight the syntax. `html`, `css`, `js` are available. This is required and can be set using a JavaScript property (`anatomy.language = 'html'`).|
| `placeholder` | The content to display when a bullet is created. Defaults to "placeholder". This can be set using a JavaScript property (`anatomy.placeholder = 'My example'`) |

## Accessibility

Each marker is tabbable and `aria-describedby` an `id` that references the related item in the numbered list. When a numbered item is hovered, `aria-current` is applied to the marker.

[Edit Mode](#edit-mode) is less accessible; the descriptions aren't tabbable. This is due to the re-render that occurs on blur of the description and focus is lost.

## Customizing

Font styles are inherited from the components' ancestors. Changing the font attributes is as simple as changing them on the containing element or higher up. A `<ol/>` is used to display the list items; pay attention to the alignment of the numbers here. Monospaced fonts might look better as the list is aligned to the bullet, not to the left.

The text color for the numbered list items is also inherited. Other colors can be changed using CSS Custom Properties:

| Property | Description |
| -------- | ----------- |
| `--code-anatomy--code-bg` | Background of code |
| `--code-anatomy--code-fg` | Foreground of code |
| `--code-anatomy--token-comment` | Color of comments |
| `--code-anatomy--token-punctuation` | Color for punctuation |
| `--code-anatomy--token-property` | Color for properties, tags, symbols, constants |
| `--code-anatomy--token-number` | Color for numbers and booleans |
| `--code-anatomy--token-string` | Color for strings, attribute names, selectors |
| `--code-anatomy--token-variable` | Color for variables, operators, urls |
| `--code-anatomy--token-function` | Color for at-rules, attribute values, functions |
| `--code-anatomy--token-keyword` | Color for keywords |
| `--code-anatomy--token-important` | Color for important, regex |
| `--code-anatomy--link-fg` | Foreground of links in the list |
