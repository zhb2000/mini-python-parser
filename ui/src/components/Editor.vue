<template>
  <div class="editor-outer">
    <div class="editor-bar">
      <div class="bar-msg">{{ errorMsg }}</div>
      <button class="parse-btn" @click="parseClick">Parse</button>
    </div>
    <textarea
      v-model="code"
      class="editor-textarea"
      wrap="off"
      placeholder="input Python code here..."
      @keydown.tab.prevent="tabDown($event)"
    />
  </div>
</template>

<script>
import * as examples from "./examples.js";

export default {
  props: {
    errorMsg: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      code: examples.fibonacci,
    };
  },
  methods: {
    parseClick() {
      this.$emit("parseClick", this.code);
    },
    tabDown(event) {
      const text = this.code;
      const originalSelectionStart = event.target.selectionStart;
      const textStart = text.slice(0, originalSelectionStart);
      const textEnd = text.slice(originalSelectionStart);
      this.code = textStart + "    " + textEnd;
      event.target.value = this.code; // required to make the cursor stay in place.
      event.target.selectionEnd = event.target.selectionStart =
        originalSelectionStart + 4;
    },
  },
};
</script>

<style>
.editor-outer {
  display: grid;
  grid-template-rows: 50px 1fr;
}

.editor-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid #c4c4c4;
}

.bar-msg {
  flex-grow: 1;
  padding: 0px 20px;
  color: #c60f13;
}

.parse-btn {
  margin-right: 8px;
  border-radius: 4px;
  padding: 8px 10px;
  border: 0px;
  font-weight: bold;
  font-size: 16px;
  background: dodgerblue;
  color: white;
}
.parse-btn:hover {
  background: #3178c6;
}
.parse-btn:active {
  background: #235a97;
}

.editor-textarea {
  resize: none;
  font-size: 18px;
  padding: 20px;
  font-family: Consolas, "Courier New", Courier, monospace;
  overflow: auto;
  border: 0px;
  outline: none;
}

.editor-textarea:focus {
  outline: none;
}
</style>