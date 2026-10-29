# 看板娘模型与候选

当前内置 `z16`、`hibiki`、`shizuku`、`haru01`、`koharu`、`miku`、`tororo`、`nito`、`haru02`、`izumi`、`chitose`、`nico` 和 `tsumiki`。通过主题配置的 `effects.live2d_models` 设置本地模型路径与尺寸，`effects.live2d_model` 指定默认模型。`effects.live2d_scale` 设置默认缩放，每个模型也可以单独添加 `scale`。`effects.live2d_rotation` 可设置轮换名单与秒数，关闭 `enable` 则固定显示默认模型。新增模型时应完整保留配置文件引用的模型、贴图、动作、物理、表情及声音文件。

模型可在 [模型展示页](https://joeybling.github.io/live2d-widget.js/examples/index.html)预览：

| 模型 | 来源 | 素材许可情况 |
| --- | --- | --- |
| haru01 | [live2d-widget-models](https://github.com/xiazeyu/live2d-widget-models)，本地 yilia-plus 主题 | 需核对原权利人条款 |
| koharu | [live2d-widget-models](https://github.com/xiazeyu/live2d-widget-models) | 需核对原权利人条款 |
| miku | [live2d-widget-models](https://github.com/xiazeyu/live2d-widget-models) | 需核对原权利人条款 |
| tororo | [live2d-widget-models](https://github.com/xiazeyu/live2d-widget-models) | 需核对原权利人条款 |
| nito | [live2d-widget-models](https://github.com/xiazeyu/live2d-widget-models) | 需核对原权利人条款 |
| haru02、izumi、chitose、nico、tsumiki | 本地 yilia-plus 主题的 live2d-widget-models 资源 | 需核对原权利人条款 |

模型库声明的代码许可证不代表每个角色素材均可任意使用。现有 Hibiki 可参考 [Live2D 官方素材页面](https://www.live2d.com/en/learn/sample/hibiki/)中的具体使用条款。z16 来源和许可状态见其目录中的 README。

collection 目录包含另外 100 个本地模型（含部分服装版本），编号、来源和对缺失可选资源的处理记录见 collection/SOURCES.txt。来源站说明素材权利属于各原作者，并限制为学习和非营利用途；公开使用前应逐项核实素材授权。

轮换 mode 为 random 时，页面打开时随机选择一个模型，定时随机切换并避免连续显示同一模型；设为 sequence 时从默认模型开始按名单顺序轮换。关闭 enable 则固定显示默认模型。

显示范围说明：z16、haru01、haru02、chitose 和 izumi 的本地素材本身只绘制了部分身体；这些模型单独设置了 v_offset，下移画布让素材下沿靠近屏幕底部。每个模型的 v_offset 覆盖全局 live2d_v_offset，单位为像素，负值表示向下移动。shizuku 为坐在桌后的造型。
