# Presenter Notes — JSONB: Beyond the Rows

**Target duration:** approximately 9 minutes. Read naturally and pause at the interactive lab.

## Slide 01

Today I'll show how PostgreSQL lets us query flexible, nested data without leaving SQL. We will compare JSON and JSONB, learn the key operators, explore nested queries and JSONPath, and finish with performance and production advice. There is also an interactive mini-lab where you can change search conditions and watch the SQL update.

## Slide 02

Imagine a product catalog. A laptop has RAM and a CPU, but a headset has wireless properties. If every new product attribute requires a new database column, our table becomes difficult to maintain. JSONB lets us store these variable attributes together while continuing to query them with SQL. However, flexibility is valuable only if the information remains discoverable and usable.

## Slide 03

PostgreSQL supports two different types for JSON-shaped data. JSON stores the input text, including whitespace and object key order. JSONB stores a decomposed binary representation that is faster to process in most querying situations and can be indexed. JSONB does not preserve object key order or duplicate keys. The tradeoff is conversion when data is inserted. For analytics and application queries, JSONB is often the practical choice.

## Slide 04

We'll work with one catalog table. It has a conventional numeric primary key and a JSONB data column. The JSONB column can include each product's name, category, price, tags, and optional attributes. Our six-record demo contains three laptops, two headsets, and one keyboard. Notice how we combine relational structure for stable identifiers with JSONB flexibility for attributes that differ between products. The complete sample dataset is included with the presentation.

## Slide 05

The operators are small but powerful. A single arrow extracts a JSON value; a double arrow extracts text. At-sign greater-than tests whether a JSON document contains a structure. Question mark checks whether a top-level key, or string array element, exists. Hash double-arrow takes a path of nested keys and returns text. Finally, at-question-mark enables JSONPath existence searches for more complex conditions.

## Slide 06

Let's extract the RAM value. The path data to specs to ram returns the JSONB number 16. If we use hash-double-arrow with a path array, the output is the text string 16. That difference matters for comparisons: comparing numbers as text can produce incorrect ordering, so we cast the extracted value to integer. Also remember that a missing key normally produces SQL NULL rather than an exception for these extraction operators.

## Slide 07

Here are two real queries on our catalog. The containment operator selects all JSONB documents whose category is laptop, returning three products. The existence operator tests whether specs is a top-level key; in this dataset, those are also the three laptops. These queries happen to return the same rows, but they ask different questions. Key existence is not a recursive search and does not check arbitrary nested attributes.

## Slide 08

Now let's test these ideas. The controls on the left choose a category, a minimum amount of RAM, and a maximum price. The right side shows the corresponding PostgreSQL SQL and which sample records match. Try selecting laptops, sixteen gigabytes of RAM, and a maximum price of fifteen hundred dollars. Only Atlas Pro 14 remains. This interface is a deterministic browser teaching simulator, not a live database; the included SQL seed file lets you reproduce the queries in PostgreSQL.

## Slide 09

JSONPath is useful when we need more expressive document searches. The first query uses at-question-mark to look inside the tags array for the string gaming; it matches Pulse X and Forge 16. The second query uses double-at to evaluate the predicate that price exceeds one thousand; it matches Atlas Pro 14 and Forge 16. These operators have distinct semantics, and PostgreSQL can use appropriate GIN indexes for certain JSONPath patterns.

## Slide 10

JSONB is not only about retrieving a document. We can turn a JSON array into relational rows with jsonb_array_elements_text and a lateral join. Here we expand every product's tags and count the frequency of each tag. Gaming, premium, and wireless each appear twice in our small dataset. This pattern is useful for dashboards, usage analytics, and category reporting while retaining a flexible source document.

## Slide 11

Performance requires the right kind of index. A default GIN index using jsonb_ops supports containment, key existence, and supported JSONPath searches. The jsonb_path_ops operator class is more specialized and can be effective for containment and JSONPath, but it does not support the question-mark existence operator. For comparisons on a scalar such as price, an expression-based B-tree index may be more suitable. Indexes help specific workloads; they also take storage and make writes more expensive.

## Slide 12

Do not trust an index simply because it exists. Use EXPLAIN with ANALYZE and BUFFERS to inspect the actual execution and data-access behavior. On a table with only six rows, PostgreSQL may rightly prefer a sequential scan. On larger data, a suitable index may lead to a bitmap index scan. The diagrams here show possible plan shapes, not a measured speed improvement. Always test against realistic volumes and distributions.

## Slide 13

There are four mistakes worth avoiding. First, the double arrow returns text, so cast for numeric comparisons. Second, the existence operator is not a recursive search. Third, indexes cost disk space and update work. Fourth, JSONB is not a replacement for relational modeling: stable primary keys, foreign keys, and heavily joined data often belong in regular SQL columns. The goal is a balanced design, not putting everything into one document.

## Slide 14

Before the summary, three quick checks. Which arrow returns text? The double arrow. Does the question-mark operator search nested objects recursively? No, it checks only the top level. And does jsonb_path_ops support question-mark key existence? No; the default jsonb_ops class does. If the audience can answer these three questions, they understand the most common sources of mistakes in JSONB querying.

## Slide 15

To conclude, JSONB combines flexible document storage with the analytical power of SQL. Extraction operators help navigate documents, JSONPath helps with more complex conditions, and lateral functions unlock conventional SQL aggregation. A thoughtful indexing strategy can improve performance, but must be validated against real queries. The references here link to the official PostgreSQL documentation for each major topic. Thank you for listening. I'm happy to take questions.

