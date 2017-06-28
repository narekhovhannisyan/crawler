const fs = require('fs')
const flowRemoveTypes = require('flow-remove-types')
const path = require('path')
const source = './flow'
const target = './dist'

const processFile = (ext, processor) => file => {
  if (fs.statSync(path.join(_source, file)).isDirectory()) {
    // if (!fs.existsSync(path.join(_target, file))) {
    // fs.mkdirSync(path.join(_target, file))
    //   console.log('way 1')
    //   return processFile(path.join(_source, file), path.join(_target, file))
    // } else {
    //   console.log('way 2')
    return recursiveScan(path.join(_source, file), path.join(_target, file))

    //}
  } else {
    console.log('creating file')
    if (fs.statSync(path.join(_source, file)).isFile() && path.extname(path.join(_source, file)) == ext) {
      console.log('found javascript file')
      const input = fs.readFileSync(path.join(_source, file), 'utf8')
      const output = processor(input)
      fs.writeFileSync(path.join(_target, file), output.toString())
    } else {
      console.log('other format, just copying file')
      const input = fs.readFileSync(path.join(_source, file), 'utf8')
      fs.writeFileSync(path.join(_target, file), input.toString())
    }
  }
}

const recursiveScan = (_source, _target) => {
  console.log('starting recursive scanning process!')
  const process = processFile('.js', flowRemoveTypes)
  fs.readdirSync(_source).forEach(process)
}
//TODO! implement recursive scanner (recursive scanner must return file's path and extension), other functions may understand what they want to do

recursiveScan(source, target)
