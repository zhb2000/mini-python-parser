<template>
  <div class="full-holder">
    <editor :errorMsg="errorMsg" @parseClick="parseClick" />
    <div class="separator" />
    <display
      :tokens="tokens"
      :parseTree="parseTree"
      :ast="ast"
      :tree="tree"
      :showTreeProp="outShowTree"
    />
  </div>
</template>

<script>
import Editor from "./Editor.vue";
import Display from "./Display.vue";
import { Scanner } from "../../../dist/src/scanner/scanner.js";
import { Parser } from "../../../dist/src/parser/parser.js";
import * as examples from "./examples.js";

export default {
  data() {
    return {
      scanner: new Scanner(),
      parser: new Parser(),
      errorMsg: "",
      tokens: [],
      parseTree: {},
      ast: {},
      tree: { display: "root", children: [] },
      outShowTree: true,
    };
  },
  mounted() {
    this.parseClick(examples.fibonacci);
  },
  methods: {
    parseClick(code) {
      try {
        this.outShowTree = false;
        const tokens = this.scanner.scan(code);
        const parseTree = this.parser.toParseTree(code);
        const ast = parseTree.toASTNode();
        this.errorMsg = "";
        this.tokens = tokens.map((tk) => tk.repr());
        this.parseTree = parseTree.repr();
        this.ast = ast.repr();
        this.tree = ast;
        //必须延时执行渲染，否则会有 BUG
        setTimeout(() => (this.outShowTree = true), 100);
      } catch (error) {
        this.errorMsg = error.toString();
        this.tokens = [];
        this.parseTree = {};
        this.ast = {};
        this.tree = { display: "root", children: [] };
        this.outShowTree = false;
      }
    },
  },
  components: { Editor, Display },
};
</script>

<style>
.full-holder {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
}

.separator {
  width: 100%;
  height: 100%;
  background: #c4c4c4;
}
</style>