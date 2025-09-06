/**
 * EditorJS List Plugin
 * A comprehensive list tool for EditorJS supporting ordered and unordered lists
 */

// EditorJS API Types
interface EditorAPI {
  styles: {
    block: string;
  };
  i18n: {
    t(key: string): string;
  };
  blocks: {
    insert(
      type?: string,
      data?: any,
      config?: any,
      index?: number,
      needToFocus?: boolean
    ): void;
  };
  caret: {
    setToBlock(index: number): void;
  };
}

interface ToolboxConfig {
  icon: string;
  title: string;
}

interface ConversionConfig {
  import: string;
  export: (data: ListData) => string;
}

interface SanitizerConfig {
  [key: string]: boolean | SanitizerConfig;
}

// Plugin-specific types
interface ListData {
  style: "ordered" | "unordered";
  items: string[];
}

interface ListToolConfig {
  placeholder?: string;
}

interface ListToolConstructorParams {
  data: Partial<ListData>;
  config: ListToolConfig;
  api: EditorAPI;
  readOnly: boolean;
}

interface ListSetting {
  name: "ordered" | "unordered";
  title: string;
  icon: string;
  default?: boolean;
}

interface CSSClasses {
  baseClass: string;
  wrapper: string;
  wrapperOrdered: string;
  wrapperUnordered: string;
  item: string;
  settingsButton: string;
  settingsButtonActive: string;
}

class ListTool {
  private api: EditorAPI;
  private readOnly: boolean;
  private config: ListToolConfig;
  private CSS: CSSClasses;
  private settings: ListSetting[];
  private data: ListData;
  private listStyle: "ordered" | "unordered";
  private wrapper!: HTMLOListElement | HTMLUListElement;

  /**
   * Plugin identifier
   */
  static get toolbox(): ToolboxConfig {
    return {
      icon: `<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.625 4.85h9.25a.875.875 0 0 1 0 1.75h-9.25a.875.875 0 0 1 0-1.75zm0-4.85h9.25a.875.875 0 0 1 0 1.75h-9.25a.875.875 0 0 1 0-1.75zm0 9.85h9.25a.875.875 0 0 1 0 1.75h-9.25a.875.875 0 0 1 0-1.75zM.954 5.725c.54 0 .954-.414.954-.954s-.414-.954-.954-.954S0 4.231 0 4.771s.414.954.954.954zm0-4.85c.54 0 .954-.414.954-.954S1.494 0 .954 0 0 .414 0 .954s.414.954.954.954zm0 9.85c.54 0 .954-.414.954-.954s-.414-.954-.954-.954S0 9.731 0 10.271s.414.954.954.954z"/>
      </svg>`,
      title: "List",
    };
  }

  /**
   * Allow conversion from other blocks
   */
  static get conversionConfig(): ConversionConfig {
    return {
      import: "text",
      export: function (listData: ListData): string {
        return listData.items.join(". ");
      },
    };
  }

  /**
   * Allow to press Enter inside the List
   */
  static get enableLineBreaks(): boolean {
    return true;
  }

  /**
   * Default placeholder
   */
  static get DEFAULT_PLACEHOLDER(): string {
    return "List item";
  }

  /**
   * Constructor
   * @param options - tool options
   */
  constructor({ data, config, api, readOnly }: ListToolConstructorParams) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};

    this.CSS = {
      baseClass: this.api.styles.block,
      wrapper: "cdx-list",
      wrapperOrdered: "cdx-list--ordered",
      wrapperUnordered: "cdx-list--unordered",
      item: "cdx-list__item",
      settingsButton: "cdx-list-settings__button",
      settingsButtonActive: "cdx-list-settings__button--active",
    };

    this.settings = [
      {
        name: "unordered",
        title: "Unordered",
        icon: `<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.625 4.85h9.25a.875.875 0 0 1 0 1.75h-9.25a.875.875 0 0 1 0-1.75zm0-4.85h9.25a.875.875 0 0 1 0 1.75h-9.25a.875.875 0 0 1 0-1.75zm0 9.85h9.25a.875.875 0 0 1 0 1.75h-9.25a.875.875 0 0 1 0-1.75zM.954 5.725c.54 0 .954-.414.954-.954s-.414-.954-.954-.954S0 4.231 0 4.771s.414.954.954.954zm0-4.85c.54 0 .954-.414.954-.954S1.494 0 .954 0 0 .414 0 .954s.414.954.954.954zm0 9.85c.54 0 .954-.414.954-.954s-.414-.954-.954-.954S0 9.731 0 10.271s.414.954.954.954z"/>
        </svg>`,
        default: true,
      },
      {
        name: "ordered",
        title: "Ordered",
        icon: `<svg width="17" height="13" viewBox="0 0 17 13" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.819 4.607h9.362a.631.631 0 1 1 0 1.262H5.819a.631.631 0 1 1 0-1.262zm0-3.5h9.362a.631.631 0 1 1 0 1.262H5.819a.631.631 0 1 1 0-1.262zm0 7h9.362a.631.631 0 1 1 0 1.262H5.819a.631.631 0 1 1 0-1.262zM1.213 1.107V.035H.035v1.072h1.178zm.875.875H.035v1.072h2.053V1.982zm0 2.187v1.072H.035v1.072h2.053V4.169z"/>
        </svg>`,
      },
    ];

    const defaultSetting = this.settings.find((tune) => tune.default === true);
    this.data = {
      style: (data.style as "ordered" | "unordered") || defaultSetting!.name,
      items: data.items || [],
    };

    this.listStyle = this.data.style;
  }

  /**
   * Returns List Tool's UI
   */
  render(): HTMLElement {
    this.wrapper = this.makeListWrapper(this.listStyle, [
      this.CSS.baseClass,
      this.CSS.wrapper,
    ]);

    // Fill with data
    if (this.data.items.length) {
      this.data.items.forEach((itemText: string) => {
        this.wrapper.appendChild(this.createItem(itemText, []));
      });
    } else {
      this.wrapper.appendChild(this.createItem());
    }

    if (!this.readOnly) {
      // Detect keydown on the last item to escape List
      this.wrapper.addEventListener(
        "keydown",
        (event: Event) => {
          const keyboardEvent = event as KeyboardEvent;
          const [ENTER, BACKSPACE] = [13, 8];

          switch (keyboardEvent.keyCode) {
            case ENTER:
              this.enterPressed(keyboardEvent);
              break;
            case BACKSPACE:
              this.backspace(keyboardEvent);
              break;
          }
        },
        false
      );
    }

    return this.wrapper;
  }

  /**
   * Handle Enter key press
   */
  private enterPressed(event: KeyboardEvent): void {
    const currentItem = (event.target as HTMLElement).closest(
      `.${this.CSS.item}`
    ) as HTMLLIElement;

    if (!currentItem) return;

    // If current item is empty and it's not the first item, remove it and exit list
    if (
      this.getItemText(currentItem).trim().length === 0 &&
      this.wrapper.children.length > 1
    ) {
      const currentIndex = Array.from(this.wrapper.children).indexOf(
        currentItem
      );
      currentItem.remove();

      // Create a new paragraph block after the list
      this.api.blocks.insert("paragraph", {}, {}, currentIndex, true);
      this.api.caret.setToBlock(currentIndex);
      event.preventDefault();
      return;
    }

    // Create new list item
    const newItem = this.createItem();
    currentItem.after(newItem);
    this.focusItem(newItem);
    event.preventDefault();
  }

  /**
   * Handle Backspace key press
   */
  private backspace(event: KeyboardEvent): void {
    const currentItem = (event.target as HTMLElement).closest(
      `.${this.CSS.item}`
    ) as HTMLLIElement;

    if (!currentItem) return;

    const currentIndex = Array.from(this.wrapper.children).indexOf(currentItem);

    // If at the beginning of the first item and it's empty, convert to paragraph
    if (
      currentIndex === 0 &&
      this.getItemText(currentItem).trim().length === 0 &&
      this.wrapper.children.length === 1
    ) {
      this.api.blocks.insert("paragraph", {}, {}, undefined, true);
      event.preventDefault();
      return;
    }

    // If current item is empty and not the first item, remove it and focus previous
    if (this.getItemText(currentItem).trim().length === 0 && currentIndex > 0) {
      const previousItem = this.wrapper.children[
        currentIndex - 1
      ] as HTMLLIElement;
      currentItem.remove();
      this.focusItem(previousItem, true); // Focus at the end
      event.preventDefault();
      return;
    }
  }

  /**
   * Create a list wrapper with given style
   */
  private makeListWrapper(
    style: "ordered" | "unordered",
    classes: string[] = []
  ): HTMLOListElement | HTMLUListElement {
    const tag = style === "ordered" ? "ol" : "ul";
    const listElement = document.createElement(tag) as
      | HTMLOListElement
      | HTMLUListElement;

    listElement.classList.add(
      ...classes,
      style === "ordered" ? this.CSS.wrapperOrdered : this.CSS.wrapperUnordered
    );

    return listElement;
  }

  /**
   * Create list item
   */
  private createItem(
    content: string = "",
    classes: string[] = []
  ): HTMLLIElement {
    const itemElement = document.createElement("li");

    itemElement.classList.add(this.CSS.item, ...classes);
    itemElement.innerHTML = content || "";
    itemElement.contentEditable = (!this.readOnly).toString();
    itemElement.dataset.placeholder = this.api.i18n.t(
      this.config.placeholder || ListTool.DEFAULT_PLACEHOLDER
    );

    return itemElement;
  }

  /**
   * Get item text content
   */
  private getItemText(item: HTMLLIElement): string {
    return item.textContent || "";
  }

  /**
   * Focus on item
   */
  private focusItem(item: HTMLLIElement, atEnd: boolean = false): void {
    item.focus();

    if (atEnd) {
      // Move cursor to the end
      const range = document.createRange();
      const selection = window.getSelection();
      if (selection) {
        range.selectNodeContents(item);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  /**
   * Renders Block Tune Menu
   */
  renderSettings(): HTMLElement {
    const wrapper = document.createElement("div");

    this.settings.forEach((tune: ListSetting) => {
      const tuneButton = document.createElement("div");

      tuneButton.classList.add(this.CSS.settingsButton);
      tuneButton.innerHTML = tune.icon;
      tuneButton.title = tune.title;

      if (tune.name === this.listStyle) {
        tuneButton.classList.add(this.CSS.settingsButtonActive);
      }

      tuneButton.addEventListener("click", () => {
        this.toggleTune(tune.name);

        // Update active state
        wrapper
          .querySelectorAll(`.${this.CSS.settingsButton}`)
          .forEach((button: Element) => {
            button.classList.remove(this.CSS.settingsButtonActive);
          });
        tuneButton.classList.add(this.CSS.settingsButtonActive);
      });

      wrapper.appendChild(tuneButton);
    });

    return wrapper;
  }

  /**
   * Toggle list style
   */
  private toggleTune(style: "ordered" | "unordered"): void {
    const newListElement = this.makeListWrapper(style, [
      this.CSS.baseClass,
      this.CSS.wrapper,
    ]);

    // Move all items to new list element
    Array.from(this.wrapper.children).forEach((item: Element) => {
      newListElement.appendChild(item);
    });

    // Replace wrapper
    this.wrapper.replaceWith(newListElement);
    this.wrapper = newListElement;
    this.listStyle = style;
  }

  /**
   * Extract Tool's data from the view
   */
  save(): ListData {
    const items = Array.from(this.wrapper.children)
      .map((item: Element) => this.getItemText(item as HTMLLIElement))
      .filter((item: string) => item.trim().length > 0);

    return {
      style: this.listStyle,
      items: items,
    };
  }

  /**
   * Validate data: check if List has items
   */
  static validate(savedData: ListData): boolean {
    return savedData.items.length > 0;
  }

  /**
   * Sanitizer rules
   */
  static get sanitize(): SanitizerConfig {
    return {
      style: {},
      items: {
        br: true,
        b: true,
        i: true,
        strong: true,
        em: true,
        u: true,
        s: true,
        sup: true,
        sub: true,
        code: true,
        mark: true,
      },
    };
  }

  /**
   * CSS styles
   */
  static get CSS_STYLES(): string {
    return `
      .cdx-list {
        margin: 0;
        padding-left: 40px;
        outline: none;
      }

      .cdx-list__item {
        padding: 5.5px 0 5.5px 3px;
        line-height: 1.6em;
        outline: none;
      }

      .cdx-list__item[data-placeholder]:empty::before {
        content: attr(data-placeholder);
        color: #707684;
        font-weight: normal;
        opacity: 0.6;
      }

      .cdx-list-settings__button {
        width: 26px;
        height: 26px;
        border-radius: 5px;
        cursor: pointer;
        border: 1px solid transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        user-select: none;
      }

      .cdx-list-settings__button:hover {
        background-color: #eff2f5;
      }

      .cdx-list-settings__button--active {
        background-color: #369FFF;
        color: white;
      }

      .cdx-list-settings__button--active:hover {
        background-color: #0f6fcc;
      }

      .cdx-list-settings__button svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
    `;
  }
}

// Auto-inject CSS styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = ListTool.CSS_STYLES;
  document.head.appendChild(styleSheet);
}

// Export for different module systems
declare global {
  interface Window {
    ListTool: typeof ListTool;
  }
}

export default ListTool;

// CommonJS export
if (typeof module !== "undefined" && module.exports) {
  module.exports = ListTool;
}

// AMD export
declare const define: any;
if (typeof define === "function" && define.amd) {
  define(() => ListTool);
}

// Global export
if (typeof window !== "undefined") {
  window.ListTool = ListTool;
}
