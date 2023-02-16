#! /usr/bin/env node
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import chalk from 'chalk';
import prompts from 'prompts'
import fs from 'node:fs'
import path from 'node:path'
import ejs from 'ejs'
import { fileURLToPath } from 'node:url'
import ora from 'ora';
import download from 'download-git-repo';
import figlet from 'figlet';

const __dirname = path.resolve();


console.log(figlet.textSync('Welcome!', {
    font: 'Ghost',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 100,
    whitespaceBreak: true
}));
console.log(chalk.bgBlueBright('welcome to my scaffold'));

const promptsOptions = [
    {
        type: 'text',
        name: 'name',
        message: '项目名',
        validate(val) {
            if (!val) return '模板名称不能为空！';
            if (fs.existsSync(val)) return '项目名已存在'
            if (val.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g)) return '模板名称包含非法字符，请重新输入';
            return true;
        }
    },
    {
        type: 'text',
        name: 'password',
        message: '版本'
    },
    {
        type: 'select',//单选
        name: 'template',
        message: '模板选择',
        choices: [
            { title: 'vue2', value: 1 },
            { title: 'vue3', value: 2 },
            { title: 'react', value: 3 },
            { title: 'react-ts', value: 4 },
            { title: 'vue3-local', value: 5 },
            { title: 'react-local', value: 6 },
        ]
    },
    //   {
    //     type: 'multiselect', //多选
    //     name: 'study',
    //     message: '选择学习框架',
    //     choices: [
    //       { title: 'Vue', value: 0 },
    //       { title: 'React', value: 1 },
    //       { title: 'Angular', value: 2 }
    //     ]
    //   },
]
const remoteList = {
    1: ['https://github.com/lstoeferle/vite-vue2-windicss-starter.git', 'main'],
    2: ['https://github.com/antfu/vitesse.git', 'main'],
    3: ['https://github.com/wtchnm/Vitamin.git', 'main'],
    4: ['https://fukai03@icode.baidu.com/baidu/acg-det/vcl-scaffolding-fe', 'master'] //组内react脚手架
}
// 远程模板克隆函数
const gitClone = (remote, name, option) => {
    const downSpinner = ora('正在下载模板...').start();
    return new Promise((resolve, reject) => {
        download(remote, name, option, err => {
            if (err) {
                downSpinner.fail();
                console.log("err", chalk.red(err));
                reject(err);
                return;
            };
            downSpinner.succeed(chalk.green('模板下载成功！'));
            console.log(`Done. Now run:\r\n`);
            console.log(chalk.green(`cd ${name}`));
            console.log(chalk.blue("npm install"));
            console.log("npm run dev\r\n");
            resolve();
        });
    });
};

/**
 * @description 模板文件的读取、渲染以及生成
 * @param tempDir 模板路径
 * @param destDir 目标路径
 * @param answer 用户输入的内容
 */
const rw = (tempDir, destDir, answer) => {
    try {
        // console.log(tempDir, destDir);
        const files = fs.readdirSync(tempDir)

        files.forEach(file => {
            const filePath = path.join(tempDir, file)
            const targetDir = path.join(destDir, file)

            const stats = fs.statSync(filePath)

            if (stats.isFile()) {
                if (destDir.includes('img') || destDir.includes('fonts') || destDir.includes('icon') || destDir.includes('.ico')) {
                    const readStream = fs.createReadStream(filePath)
                    const writeStream = fs.createWriteStream(targetDir)
                    readStream.pipe(writeStream)
                } else {
                    ejs.renderFile(filePath, answer, (err2, res) => {
                        if (err2) throw err2
                        // 将渲染完成后的结果写入目标路径
                        fs.writeFileSync(path.join(destDir, file), res)
                    })
                }
            } else {
                fs.mkdirSync(targetDir)
                rw(filePath, targetDir, answer)
            }
        })

    } catch (e) {
        throw e
    }
}

// 脚手架本地模板克隆函数
const localClone = (templateName, projectName) => {
    // 模板路径
    const tempDir = path.resolve(
        fileURLToPath(import.meta.url),
        './..',
        `${templateName}`,
    )
    // 目标路径
    const destDir = path.join(process.cwd(), projectName)
    // // 判断当前文件夹下是否有目标路径的目录
    // if (fs.existsSync(destDir)) {
    //     throw Error(`Folder named '${answer.name}' is already existed`)
    // }
    // 创建文件夹
    fs.mkdir(destDir, { recursive: true }, (err) => {
        if (err) throw err
    })


    // 将模板下的文件全部转换到目标目录
    rw(tempDir, destDir, {name: projectName})

    // 成功后的打印
    console.log(`Congratulations! Project '${projectName}' has been created successfully~`)

}

const templateNameList = {
    5: 'template-vue3'
}
// 获取用户交互信息并处理
const getInputInfo = async () => {
    const res = await prompts(promptsOptions)
    console.log(res)
    if (!res.name || !res.template) return


    if (res.template > 4) { // 拉取脚手架本地模板
        let templatename = templateNameList[res.template] || 'template-vue3'
        console.log(templatename);
        localClone(templatename, res.name)
    } else { // 拉取线上模板
        gitClone(`direct:${remoteList[res.template][0]}#${remoteList[res.template][1]}`, res.name, { clone: true })
    }

}



//帮助内容
const helpSections = [
    {
        header: 'create-vue-k',
        content: '一个自定义快速生成项目环境的脚手架',
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'version',
                typeLabel: '{underline boolean}',
                description: '版本号',
            },
            {
                name: 'template',
                typeLabel: '{underline string}',
                description: '模板',
            }
        ],
    },
];

// 配置命令参数
const optionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'arg1', type: String },
    { name: 'arg2', type: Number },
]

const options = commandLineArgs(optionDefinitions)



if (options.help) {
    console.log(chalk.green(commandLineUsage(helpSections)));
} else {
    console.log(options);
    getInputInfo()
}
