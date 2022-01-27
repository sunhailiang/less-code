import { $Dropdown, DropdownItem } from "@/components";
import useTop from "./top";
import { $Dialog } from "@/components";

export const onContextMenuBlock = (e, block, data) => {
  console.log("今来没？", data);
  e.preventDefault();
  let { commands } = useTop(data);

  $Dropdown({
    el: e.target,
    block,
    content: () => {
      return (
        <>
          <DropdownItem
            label="删除"
            icon="iconfont icon-shanchu"
            onClick={() => commands.delete()}
          ></DropdownItem>
          <DropdownItem
            label="置顶"
            icon="iconfont icon-dingceng"
            onClick={() => commands.toMaxIndex()}
          ></DropdownItem>
          <DropdownItem
            label="置底"
            icon="iconfont icon-diceng"
            onClick={() => commands.toLowIndex()}
          ></DropdownItem>
          <DropdownItem
            label="查看"
            icon="iconfont icon-daochu"
            onClick={() => {
              $Dialog({
                title: "查看节点",
                content: JSON.stringify(block),
              });
            }}
          ></DropdownItem>
          <DropdownItem
            label="替换"
            icon="iconfont icon-daoru"
            onClick={() => {
              $Dialog({
                title: "导入节点数据",
                content: "",
                footer: true,
                onConfirm(data) {
                  data = JSON.parse(data);
                  // 替换组件
                  commands.updateBlock(data, block);
                },
              });
            }}
          ></DropdownItem>
        </>
      );
    },
  });
};
