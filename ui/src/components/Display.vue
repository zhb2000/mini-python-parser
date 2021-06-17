<template>
  <div class="display-outer">
    <div class="display-bar">
      <div
        :class="['tab-title', { 'tab-title-active': tokensActive }]"
        @click="tokensTitleClick"
      >
        Tokens
      </div>
      <div
        :class="['tab-title', { 'tab-title-active': parseTreeActive }]"
        @click="parseTreeTitleClick"
      >
        Parse Tree
      </div>
      <div
        :class="['tab-title', { 'tab-title-active': astActive }]"
        @click="astTitleClick"
      >
        AST
      </div>
      <div
        :class="['tab-title', { 'tab-title-active': treeActive }]"
        @click="treeTitleClick"
      >
        Tree
      </div>
    </div>
    <div class="json-area">
      <json-view :data="tokens" v-if="tokensActive" />
      <json-view :data="parseTree" v-if="parseTreeActive" />
      <json-view :data="ast" v-if="astActive" />
      <div v-if="treeActive" style="width: 99%; height: 99%">
        <tree
          v-model="tree"
          :data="tree"
          node-text="display"
          layoutType="vertical"
          :duration="0"
          :zoomable="true"
          style="width: 99%; height: 99%"
        />
        <!-- 必须给 tree 设置 width 和 height，
        而且必须小于 100%，否则会出现奇怪动效 -->
      </div>
    </div>
  </div>
</template>

<script>
import jsonView from "vue-json-views";
import { tree } from "vued3tree";

export default {
  props: {
    tokens: {
      type: Array,
      default: () => [],
    },
    parseTree: {
      type: Object,
      default: () => {},
    },
    ast: {
      type: Object,
      default: () => {},
    },
    tree: {
      type: Object,
      default: () => {
        return { display: "root", children: [] };
      },
    },
    /** 
     * 修改 data 后，tree 不会自动重新渲染
     * 
     * 只好让外层控件手动控制它重新渲染
     */
    showTreeProp: {
      type: Boolean, 
      default: true,
    },
  },
  data() {
    return {
      activeTab: "Tokens",
    };
  },
  computed: {
    tokensActive() {
      return this.activeTab === "Tokens";
    },
    parseTreeActive() {
      return this.activeTab === "Parse Tree";
    },
    astActive() {
      return this.activeTab === "AST";
    },
    treeActive() {
      return this.activeTab === "Tree" && this.showTreeProp;
    },
  },
  methods: {
    tokensTitleClick() {
      this.activeTab = "Tokens";
    },
    parseTreeTitleClick() {
      this.activeTab = "Parse Tree";
    },
    astTitleClick() {
      this.activeTab = "AST";
    },
    treeTitleClick() {
      this.activeTab = "Tree";
    },
  },
  components: { jsonView, tree },
};
</script>

<style>
.display-outer {
  display: grid;
  grid-template-rows: 50px 1fr;
  height: 100vh;
}

.display-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tab-title {
  margin: 0px 10px;
  padding: 3px 5px;
  border-bottom: 3px solid white;
  cursor: pointer;
}

.tab-title:hover {
  border-bottom: 3px solid #3178c6;
}

.tab-title-active {
  border-bottom: 3px solid #3178c6;
  font-weight: bold;
}

.json-area {
  overflow: auto;
}
</style>