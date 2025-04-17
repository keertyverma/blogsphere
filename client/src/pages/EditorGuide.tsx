import { PiDotsSixVerticalBold } from "react-icons/pi";

const EditorJsUserGuide = () => {
  return (
    <div className="h-cover px-0 md:px-10 documentation">
      <section className="px-6 mx-auto md:max-w-[728px] flex flex-col gap-3 py-24">
        <div>
          <h1 className="text-2xl font-medium md:text-[36px] text-slate-950 dark:text-slate-100 break-words">
            Blog Editor Guide
          </h1>
          <hr className="!my-3" />
          <p className="mt-2">
            The Blog Editor is a block-style editor designed for effortless
            content creation. It lets you structure your blog with diverse
            content blocks, apply inline styling, and format text with ease,
            ensuring a smooth and engaging writing experience.
          </p>
        </div>

        {/* Toolbar and Commands */}
        <div className="my-2">
          <h2 className="text-xl md:text-2xl font-semibold">
            Toolbar and Commands
          </h2>
          <hr />
          <ul>
            <li>
              <strong>Toolbar Options</strong>{" "}
              <p>
                Click the <code>+</code> toolbar icon to access block options
                for adding different content elements.
              </p>
              <p>
                {" "}
                The slash <code>/</code> command in the editor displays the
                available content blocks you can use.{" "}
              </p>
              <div className="w-60 md:w-72 my-2">
                <img
                  src="/docs/toolbar-options.png"
                  alt="Toolbar options"
                  loading="lazy"
                ></img>
              </div>
              <ul>
                <li>
                  <strong>Text</strong>: Adds a simple text paragraph.
                </li>
                <li>
                  <strong>Heading</strong>: Adds a heading block.
                </li>
                <li>
                  <strong>Unordered List</strong>: Creates a bulleted list.
                </li>
                <li>
                  <strong>Ordered List</strong>: Creates a numbered list.
                </li>
                <li>
                  <strong>Checklist</strong>: Creates an interactive checklist.
                </li>
                <li>
                  <strong>Image</strong>: Allows inserting an image.
                </li>
                <li>
                  <strong>Quote</strong>: Adds a styled quote block.
                </li>
                <li>
                  <strong>Code</strong>: Adds a syntax-highlighted code block.
                </li>
              </ul>
            </li>
            <li>
              <p>
                The Block Tune Setting icon{"  "}
                <PiDotsSixVerticalBold className="inline bg-input border-border border-[0.8px] rounded-md text-2xl p-0.5" />
                {"  "}appears on each block and allows modifications such as
              </p>

              <ul>
                <li>Moving the block Up or Down</li>
                <li>Deleting the block</li>
                <li>Changing specific setting based on the block type</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Inline Tools */}
        <div className="my-2">
          <h2 className="text-xl md:text-2xl font-semibold">
            Inline Tools Options
          </h2>
          <hr />
          <p>
            Inline tools let you format text directly within supported blocks,
            including Text, List, Quote and Image caption.
          </p>
          <div className="w-70 md:w-96 my-2">
            <img
              src="/docs/inline-tools.png"
              alt="Inline tool options"
              loading="lazy"
            ></img>
          </div>
          <ul>
            <li>
              <strong>Bold:</strong> Make key terms or phrases stand out (e.g.,{" "}
              <strong>Important Point</strong>)
            </li>
            <li>
              <em>Italic:</em> Emphasize words, phrases, or titles (e.g.,
              <em>Scientific Name</em>)
            </li>
            <li>
              <a href="https://example.com" className="text-blue-500 underline">
                Links
              </a>
              : Insert hyperlinks to external resources.
            </li>
            <li>
              <mark className="bg-yellow-300">Highlight</mark>: Mark important
              text for extra visibility.
            </li>
            <li>
              <code className="inline-code">Inline Code</code>: Display short
              code snippets within text.
            </li>
          </ul>
        </div>

        {/* Supported Blocks & Features */}
        <div className="mt-2">
          <h2 className="text-xl md:text-2xl font-semibold">
            Supported Blocks & Features
          </h2>
          <hr />
          <p>
            The <code>+</code> toolbar provides access to a variety of content
            blocks for insertion.
          </p>
        </div>

        {/* Heading */}
        <div className="my-2">
          <h3 className="text-lg md:text-xl font-semibold bg-input/60 p-1">
            🏷️ Headings
          </h3>
          <ul>
            <li>Use headings to structure your content hierarchically.</li>
            <li>From H1 (main title) to H6 (sub-sub-sub-sections).</li>
            <li>
              Use block tune setting{"  "}
              <PiDotsSixVerticalBold className="inline bg-input border-border border-[0.8px] rounded-md text-2xl p-0.5" />
              {"  "}to adjust the heading level from H1 to H6.
            </li>
          </ul>
        </div>

        {/* Paragraph */}
        <div className="my-2">
          <h3 className="text-lg md:text-xl bg-input/60 p-1 font-semibold">
            ✍️ Paragraph (Text)
          </h3>
          <ul>
            <li>Allows for standard paragraph text entry.</li>
            <li>
              Supports inline formatting for styling text, such as bold,
              italics, and links.
            </li>
          </ul>
        </div>

        {/* List */}
        <div className="my-2">
          <h3 className="text-lg md:text-xl font-semibold bg-input/60 p-1">
            📋 Lists
          </h3>
          <ul>
            <li>
              <p>Create different types of lists effortlessly</p>
              <ul>
                <li>
                  {" "}
                  <strong>Unordered List - </strong> Use bullets to list items
                  without a specific order.
                  <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                  </ul>
                </li>
                <li>
                  <strong>Ordered List - </strong> Use numbers to present items
                  in a sequence.
                  <ol>
                    <li>Step One</li>
                    <li>Step Two</li>
                  </ol>
                </li>
                <li>
                  <strong>Checklist - </strong> Use checkboxes for to-do items
                  or process steps.
                </li>
                <ul className="checklist">
                  <li className="checked">Task 1</li>
                  <li>Task 2</li>
                </ul>
              </ul>
            </li>
            <li>
              Supports <strong>nested lists</strong> for better organization.
              <div className="my-2 flex flex-col md:flex-row gap-4 md:gap-10">
                <img
                  src="/docs/nested-unordered-list.png"
                  alt="Documentation Screenshot"
                  loading="lazy"
                  className="w-44 md:w-1/3 "
                ></img>
                <img
                  src="/docs/nested-ordered-list.png"
                  alt="Documentation Screenshot"
                  loading="lazy"
                  className="w-44 md:w-1/3 "
                ></img>
              </div>
            </li>
            <li>
              Use block tune setting {"  "}
              <PiDotsSixVerticalBold className="inline bg-input border-border border-[0.8px] rounded-md text-2xl p-0.5" />
              {"  "} to switch between unordered, ordered, and checklist styles.
            </li>
          </ul>
        </div>

        {/* Image */}
        <div className="my-2">
          <h3 className="text-lg md:text-xl font-semibold bg-input/60 p-1">
            🖼️ Image Block
          </h3>
          <p className="mt-1 md:mt-2">Enhance your content with images.</p>
          <ul>
            <li>
              <strong>📂 Upload from Your Device</strong> - Select an image from
              your device.
            </li>
            <li>
              <strong>🌐 Insert via URL</strong>
              <ul>
                <li>
                  Simply paste an image URL into the editor—no need to select
                  the <strong>Image</strong> option from the toolbar.
                </li>
                <li>
                  ✅ <strong>Valid URLs:</strong> Must end with a common image
                  extension (.jpg, .png)
                  <ul>
                    <li>
                      <code>https://example.com/image.jpg</code>
                    </li>
                    <li>
                      <code>https://cdn.site.com/pic.png</code>
                    </li>
                  </ul>
                </li>
                <li>
                  ❌ <strong>Invalid URLs:</strong> URLs without a proper
                  extension or those with query parameters hiding the extension
                  will be rejected.
                  <ul>
                    <li>
                      <code>https://img.site.com/pic?crop=250x350</code>
                    </li>
                    <li>
                      <code>https://example.com/image</code>
                    </li>
                  </ul>
                </li>
                <div className="mt-3 p-2 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400 text-green-900 dark:text-green-300">
                  <span className="font-semibold underline">Tip</span>: When
                  copying images from Google, use{" "}
                  <span className="font-semibold">"Copy Image Address"</span>{" "}
                  instead of <span className="font-semibold">"Copy Image"</span>{" "}
                  for a valid link.
                </div>
              </ul>
            </li>
            <li>
              <strong>📋 Paste from Clipboard</strong> - Quickly paste copied
              images or screenshots directly into the editor without extra
              steps.
            </li>
            <li>
              <strong>Image Customization</strong>
              <p className="mt-1">
                Use block tune setting to modify images with the following
                options:
              </p>
              <ul>
                <li>
                  <strong>Caption</strong>: Add a descriptive text below the
                  image with customizable formatting options.
                </li>
                <li>
                  <strong>Background</strong>: Add a background to the image for
                  visual emphasis.
                </li>
                <li>
                  <strong>Stretch</strong>: Expand the image to fill the
                  available width.
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Quote */}
        <div className="my-2">
          <h3 className="text-lg md:text-xl font-semibold bg-input/60 p-1">
            📝 Quote Block
          </h3>
          <ul>
            <li>
              Use quoted text to emphasize key statements or provide context.
            </li>
            <li>Supports inline formatting for text customization.</li>
          </ul>
        </div>

        {/* Code */}
        <div className="my-2">
          <h3 className="text-lg md:text-xl font-semibold bg-input/60 p-1">
            💻 Code Block
          </h3>
          <ul>
            <li>
              Display code snippets with syntax highlighting.
              <div className="my-2">
                <img
                  src="/docs/code-block.png"
                  alt="Code block with example"
                  loading="lazy"
                ></img>
              </div>
            </li>
            <li>
              <strong>Syntax Highlighting:</strong>
              <ul>
                <li>
                  Select the programming language from the block tune setting.{" "}
                </li>
                <li>
                  The code will be formatted with appropriate colors and styles.
                </li>
                <div className="w-70 md:w-96 my-2">
                  <img
                    src="/docs/code-block-options.png"
                    alt="Code block tune setting"
                    loading="lazy"
                  ></img>
                </div>
              </ul>
            </li>
            <li>
              <strong>Show/Hide Line Numbers:</strong> Toggle line numbers for
              better readability.
            </li>
            <li>
              <strong>Copy Button:</strong> Instantly copy the code snippet to
              your clipboard.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default EditorJsUserGuide;
