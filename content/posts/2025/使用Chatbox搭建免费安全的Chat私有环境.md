---
title: "用 Chatbox 配置桌面和手机聊天客户端：魔桥接入记录"
date: "2025-08-08T17:43:22+08:00"
updated: "2026-11-25T11:04:05+08:00"
url: "/ruan-jian-bi-ji/shi-yong-chatbox-da-jian-mian-fei-an-quan-de-chat-si-you-huan-jing/"
categories: ["软件笔记"]
tags: ["软件笔记"]
summary: "记录 Chatbox 桌面版、网页版和手机版配置 API 地址、密钥与模型名称的过程。示例使用的 ModelBridge（魔桥）已下线。"
---

> 本文使用的 ModelBridge（魔桥）已下线，原服务地址和密钥已无法用于接入。以下保留当时的 Chatbox 配置和界面截图。

你是否在使用DeepSeek官网时，总是遇到“服务器繁忙，请稍后重试”的提示？

![image-20250214180555852](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214180555852.png)

又是否为在国内无法使用OPENAI的`ChatGPT`而烦恼？毕竟这个网站：https://chatgpt.com/ 根本打不开。

我当时使用 Chatbox AI 客户端，配合 ModelBridge 提供的兼容 OpenAI 的接口，在桌面和手机上访问模型。

**什么是Chatbox AI**

Chatbox AI可是一款超强大的AI客户端应用和智能助手哦，下面为你详细介绍：
1. **多模型对话**：它能连接像DeepSeek R1等全球领先的AI模型，用户可按需在软件中自由切换不同的顶尖AI模型，轻松满足各种应用场景。
2. **智能文件解析**：支持PDF、DOC、PPT、XLS、图片、代码等超多文件格式，就连PDF扫描件和手写文件都不在话下，能精准理解文件内容并给出智能响应。
3. **代码助手**：专门为开发者提供代码生成、预览、语法高亮、代码审查、重构、智能文档、调试助手、优化、安全检查等一系列实用功能。
4. **图像生成**：依据文字描述就能生成精美的图像，还能探索多种艺术风格，不管是创意设计还是营销宣传，都能满足你的多样化需求。
5. **LaTeX和Markdown支持**：支持直接输入和渲染LaTeX公式以及Markdown格式的文本，简直是学术写作与技术文档编辑的得力助手。
6. **数据存储与安全**：所有数据都存储在本地设备，充分保障你的隐私和安全。还贴心提供内置数据备份和导出功能，方便你随时检索以往的对话和消息。
7. **实时联网搜索与查询**：通过AI联网搜索，能快速获取即时信息，包括URL分析、事实核查等都不在话下。
8. **AI生成图表**：仅需简单的文字描述，就能生成清晰的可视化图表，帮你轻松理解复杂的趋势和统计信息。

**适用人群超广泛**
1. 有智能编程助手需求的开发者。
2. 寻求学术支持的学生和研究人员。
3. 渴望提升工作效率的职场人士。
4. 探索AI创作可能性的创意工作者。
5. 对尖端人工智能技术感兴趣的小伙伴们。

**认识ModelBridge**

魔桥曾为企业和开发者提供大模型 API。它兼容 OpenAI 的接口格式，当时可以用同一个客户端调用文心一言、智谱 ChatGLM、GPT、Gemini、Claude、DeepSeek 等模型。

## 准备工作很简单

- **Chatbox AI客户端**
    - 直接在线网页版：https://web.chatboxai.app/
    - 也可进入官网：https://chatboxai.app/zh#download 下载对应客户端，目前支持IOS、Android及Mac、Windows系统。
- 演示使用的是魔桥当时签发的 API 密钥。

## Chatbox桌面版或网页版自定义设置

### 第一步：选择模型提供方
打开Chatbox的设置菜单>模型一栏，将模型提供方选择为OPENAI API。

![image-20250214170517597](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214170517597.png)

### 第二步：填入关键信息
当时我在 `API Key` 一栏填入魔桥签发的密钥，在 API 域名一栏填入服务地址。下图记录了当时的设置。

![image-20250214170820789](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214170820789.png)

### 第三步：自定义模型名称
由于Chatbox默认没有deepseek-r1等模型，需要手动添加。
- 自定义添加：`deepseek-r1`、`deepseek-v3`、`Mixtral-8x7B-Instruct`。
- 注意哦，每次设置只能保存一个自定义模型，若要添加多个模型，需要重复打开设置多次，如下图所示。

![image-20250214171506350](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214171506350.png)

以上是当时桌面版和网页版的配置。

## Chatbox手机版配置

### 第一步：进入设置
进入软件，点击使用自己的API KEY或本地模型。

![image-20250214175632722](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214175632722.png)

### 第二步：完成设置
设置定义的API KEY、域名及自定义的模型名称。

![image-20250214180023836](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214180023836.png)

下图是当时手机端的对话界面。

![image-20250214180051790](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214180051790.png)

## Chatbox AI 使用展示

### 模型对话

![image-20250214171854000](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214171854000.png)

### 切换到gpt-4o，支持图片输入

![image-20250214173954081](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214173954081.png)

> 目前只有gpt-4o支持图片识别哦。

### DALLE-3图片生成

![image-20250214174129486](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20250214174129486.png)
