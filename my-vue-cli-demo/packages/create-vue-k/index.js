#! /usr/bin/env node
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import chalk from 'chalk';
import prompts from 'prompts'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ora from 'ora';
import download from 'download-git-repo';



console.log(chalk.bgBlueBright('welcome to my scaffold'));
const promptsOptions = [
    //   {
    //     type: 'text',
    //     name: 'user',
    //     message: '用户'
    //   },
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
            { title: 'react-inner', value: 4 }
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
// 模板克隆函数
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
const branch = 'main'
const getInputInfo = async () => {
    const res = await prompts(promptsOptions)
    console.log(res)
    if (!res.name || !res.template) return
    gitClone(`direct:${remoteList[res.template][0]}#${remoteList[res.template][1]}`, res.name, { clone: true })
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
            },
            {
                name: 'arg',
                typeLabel: '{underline number}',
                description: '参数',
            },
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

// function copy(src, dest) {
//     const stat = fs.statSync(src)
//     if (stat.isDirectory()) {
//       copyDir(src, dest)
//     } else {
//       fs.copyFileSync(src, dest)
//     }
// }
// function copyDir(srcDir, destDir) {
//     fs.mkdirSync(destDir, { recursive: true })
//     for (const file of fs.readdirSync(srcDir)) {
//       const srcFile = path.resolve(srcDir, file)
//       const destFile = path.resolve(destDir, file)
//       copy(srcFile, destFile)
//     }
//   }
//   const write = (file, content = '') => {
//     const targetPath = path.join(root, renameFiles[file] ?? file)
//     if (content) {
//       fs.writeFileSync(targetPath, content)
//     } else {
//       copy(path.join(templateDir, file), targetPath)
//     }
//   }

//   const templateDir = path.resolve(
//     fileURLToPath(import.meta.url),
//     '../..',
//     `${template}`,
//   )

//   const files = fs.readdirSync(templateDir)
//   for (const file of files.filter((f) => f !== 'package.json')) {
//     write(file)
//   }
//   const pkg = JSON.parse(
//     fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
//   )

//   pkg.name = packageName || getProjectName()

//   write('package.json', JSON.stringify(pkg, null, 2) + '\n')

if (options.help) {
    console.log(chalk.green(commandLineUsage(helpSections)));
} else {
    console.log(options);
    getInputInfo()
}
