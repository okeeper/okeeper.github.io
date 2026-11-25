---
title: "ModelBridge（魔桥）项目回顾：用兼容 OpenAI 的接口调用不同模型"
date: "2024-09-29T11:25:00+08:00"
updated: "2026-11-25T11:04:05+08:00"
url: "/ren-gong-zhi-neng/modelbridge-jie-shao/"
categories: ["人工智能"]
tags: ["AI", "OpenAI", "Baidu", "API 代理"]
summary: "ModelBridge（魔桥）已下线。本文保留项目运行时的接口设计，以及 Python、Java 和 curl 的调用示例。"
---



> ModelBridge（魔桥）已下线，注册和 API 服务均已停止。下文保留项目运行时的界面与接入示例。

## 项目背景

> 凌晨，OpenAI突然发出一封告知信：
>
> 不支持国家地区将会被停止使用OpenAI的API，7月9日起执行。想要继续使用的话，可以联系支持国家地区的有关服务。

![图片](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/d9c9f7c80c2896bfd619750e60ad2ee9e8b597.jpg)

> 原文对此表示的很明显：
>
> 自7月9日起，OpenAI将开始阻止来自非支持国家和地区的API流量。
>
> 受影响组织若希望继续使用OpenAl的服务，必须在其支持的国家或地区内访问。

当时，ModelBridge 尝试用一套兼容 OpenAI 的 API 接入不同模型。



## 前言：OpenAI API有什么用

在介绍ModelBridge之前，我们先来了解下OpenAI API有什么用，可以说OpenAI API的应用场景非常广泛，涵盖了从自然语言处理到图像生成等多个领域。以下是一些具体的应用场景示例：

- **自然语言处理和生成**：用于自动撰写文章、生成创意文案、构建聊天机器人、客户服务自动化等。
- **内容创建和编辑**：自动生成新闻报道、博客文章、小说等。
- **代码辅助和开发**：理解自然语言并生成相应的代码。
- **数据分析和理解**：用于会议记录、播客制作等。
- **自动化办公任务**：自动写作、自动翻译等。
- **教育和培训**：改进教育软件和服务，提供个性化的学习体验。
- **娱乐和游戏开发**：开发各种类型的游戏，包括文字游戏、图形游戏等。
- **机器人技术**：开发各种类型的机器人，包括家庭机器人、工业机器人等。
- **实时语音交互**：用于语音助手、在线教育、游戏等场景。

市面上可直接使用OpenAI API_KEY应用软件。

- **ChatBox:** 一款开源免费的跨平台OpenAI API桌面客户端，支持Windows、macOS和Linux。它允许用户自定义API Key和API Host地址，并在本地保存所有聊天记录，同时管理多个会话和设置不同的Prompt
- **OpenCat**:  专为macOS和iOS设计的原生客户端，支持自定义API地址，提供即开即用的体验，无需等待网页加载
- **PingPongChat**：一款智能AI客户端，支持iPhone、iPad、Mac等设备，无需注册账号或折腾API即可使用，基于GPT-3.5模型
- **ChatGPT-Next-Web**: 一键免费部署你的私人 ChatGPT 网页应用，支持 GPT3, GPT4 & Gemini Pro 模型。可配置自定义的base_url和api key.

## ModelBridge是什么？

ModelBridge 是一个曾提供免费体验的大模型 API 代理。下图是项目运行时的官网。

![image-20241210170317716](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20241210170317716.png)

### 1. 标准的OpenAI接口格式

ModelBridge 当时采用 OpenAI 的接口格式，熟悉这套 API 的开发者可以沿用原来的客户端。

### 2. 一次对接，模型任意切换

当时只需对接一次 API，更改请求中的 `model` 参数就能切换平台支持的模型。

### 3. 当时的免费体验

项目运营期间，用户可以免费体验接口。

### 4. 支持国内外主流大模型

项目曾接入百度文心一言、阿里、讯飞、智谱 ChatGLM 和 GPT 系列等模型。

## 当时的接入流程

### 通过邮箱登录并获取 API 密钥

下图记录了当时使用的界面。

![image-20240926155117726](https://okeeper-blog-images.oss-cn-hangzhou.aliyuncs.com/images/image-20240926155117726.png)

### 配置客户端的 API 地址

当时可以用 OpenAI SDK 或直接发送 HTTP 请求。以下代码保留原来的调用方式，已下线的服务地址统一用 `api.example.invalid` 占位。

#### 方式1：python中使用openai的官方包（新版）：

> 注意：如果是python，注意openai包的版本要对，它升级了！！
> 当时接入魔桥时，需要把 SDK 默认的请求地址改成魔桥的 API 地址。
> 所以一定要注意他在不同的包中base_url的设置方式，
> 目前已知的是：在老版本中的设置方式是：openai.api_base = BASE_URL，
> 而在新版本中的设置方式是：client = OpenAI(api_key=API_SECRET_KEY, base_url=BASE_URL)，
> 别问为什么，问就是openai的锅      



```python
import os
from openai import OpenAI
import openai
import requests
import time
import json
import time

API_SECRET_KEY = "YOURR_API_SECRECT_KEY";
BASE_URL = "https://api.example.invalid/v1/"

# chat
def chat_completions3(query):
    client = OpenAI(api_key=API_SECRET_KEY, base_url=BASE_URL)
    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": query}
        ]
    )
    print(resp)
    #print(resp.choices[0].message.content)

# chat with other model
def chat_completions4(query):
    client = OpenAI(api_key=API_SECRET_KEY, base_url=BASE_URL)
    resp = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": query}
        ]
    )
    print(resp)
    #print(resp.choices[0].message.content)
```



#### 方式2：python使用openai的官方包（旧版）, **openai=0.28.0**及以下

```python
import openai
 
#openai.api_type = "open_ai"
openai.api_key = "YOURR_API_SECRECT_KEY"
openai.api_base = "https://api.example.invalid/v1"
 
# 定义对话函数
def openai_chat(prompt):
    # 调用 OpenAI API 进行对话生成
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",#目前仅支持gpt-3.5-turbo
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
 
    # 获取生成的回复
    reply = response.choices[0].message.content
    return reply
 
# 进行对话
def chat():
    while True:
        # 提示用户输入
        user_input = input("用户：")
 
        # 结束对话的条件
        if user_input.lower() == 'bye':
            print("机器人：再见！")
            break
 
        # 调用 OpenAI 进行对话生成
        response = openai_chat(user_input)
 
        # 打印机器人的回复
        print("机器人：" + response)
 
# 调用对话函数开始对话
chat()

```



#### 方式3：使用http请求：

```python
import os
import requests
import time
import json

def chat_completions():
    url="https://api.example.invalid/v1/chat/completions"
    api_secret_key = 'xxxxxxxxx';  # 你的api_secret_key
    headers = {'Content-Type': 'application/json', 'Accept':'application/json',
               'Authorization': "Bearer "+api_secret_key}
    params = {'user':'张三','model':"gpt-3.5-turbo",
              'messages':[{'role':'user', 'content':'1+100='}]};
    r = requests.post(url, json.dumps(params), headers=headers)
    print(r)
    #print(r.json())

if __name__ == '__main__':
    chat_completions();
```



#### 方式4：使用Java客户端**chatgpt-java**

客户端Github:[https://github.com/Grt1228/chatgpt-java#1%E5%AF%BC%E5%85%A5pom%E4%BE%9D%E8%B5%96](https://github.com/Grt1228/chatgpt-java#1导入pom依赖)

- 引入第三方java sdk :

```
<dependency>
    <groupId>com.unfbx</groupId>
    <artifactId>chatgpt-java</artifactId>
    <version>1.0.14-beta1</version>
</dependency>
```

- 实例代码

  ```java
  import com.unfbx.chatgpt.OpenAiStreamClient;
  import com.unfbx.chatgpt.entity.chat.ChatCompletion;
  import com.unfbx.chatgpt.entity.chat.Message;
  import com.unfbx.chatgpt.sse.ConsoleEventSourceListener;
  import org.junit.jupiter.api.Test;
   
  import java.util.Arrays;
  import java.util.concurrent.CountDownLatch;
   
  public class ClientTest {
   
      @Test
      public void streamChatCompletion() {
          OpenAiStreamClient client = OpenAiStreamClient.builder()
                  .apiKey(Arrays.asList("ModelBridege的API_SECRECT_KEY"))
                  .apiHost("https://api.example.invalid/")
                  .build();
           
          ConsoleEventSourceListener eventSourceListener = new ConsoleEventSourceListener();
          Message message = Message.builder().role(Message.Role.USER).content("你好啊我的伙伴！").build();
          ChatCompletion chatCompletion = ChatCompletion.builder()
                  //.model(ChatCompletion.Model.GPT_3_5_TURBO.getName())
                  .model("gpt-4o")
                  .messages(Arrays.asList(message)).build();
          client.streamChatCompletion(chatCompletion, eventSourceListener);
          CountDownLatch countDownLatch = new CountDownLatch(1);
          try {
              countDownLatch.await();
          } catch(InterruptedException e) {
              e.printStackTrace();
          }
      }
  }
  ```

####  方式5：使用curl命令访问

```
curl --location --request POST 'https://api.example.invalid/v1/chat/completions' \
--header 'Authorization: Bearer ModelBridege的API_SECRECT_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
        "model": "gpt-4o-mini",
    "stream": false,
    "messages": [
        {
            "role": "user",
            "content": "你好啊!"
        }
    ]
}'
```
