const fs = require('fs')
const flowRemoveTypes = require('flow-remove-types')
const path = require('path')
const Promise = require('bluebird')
const source = './flow'

const recursiveScan = (source, processor) => {
  const process = (dir) => {
    if (fs.statSync(path.join(source, dir)).isDirectory()) {
      console.log(path.join(source, dir), '\n')
      processor(path.join(source, dir), dir)
      return recursiveScan(path.join(source, dir), processor)
    } else if (fs.statSync(path.join(source, dir)).isFile()) {
      console.log(path.join(source, dir))
      return processor(path.join(source, dir), dir)
    } else {
      return Promise.reject(Error('something wrong with the directory'))
    }
  }
  const dirs = fs.readdirSync(source)
  console.log(dirs)
  return Promise.mapSeries(dirs, dir => process(dir))
}

const removeFlowTypes = (source, target) => {
  const input = fs.readFileSync(source, 'utf8')
  const output = flowRemoveTypes(input)
  fs.writeFileSync(target, output.toString())
}

const copyFile = (source, target) => {
  const input = fs.readFileSync(source, 'utf8')
  fs.writeFileSync(target, input.toString())
}

const unflow = (source, dir) => {
  console.log('unflow called!')
  const target = source.replace('flow','dist')
  const ext = '.js'
  if (fs.statSync(source).isDirectory()) {
    /* cheking if source firectory exists in destination directory otherwise do nothing */
    if (!fs.existsSync(target)) {
      return Promise.resolve(fs.mkdirSync(target))
    } 
  } else if (fs.statSync(source).isFile() && path.extname(source) == ext) {
    return Promise.resolve(removeFlowTypes(source, target))
  } else {
    return Promise.resolve(copyFile(source, target))
  }
}

const unflowAsync = (source, dir) => {
  return Promise.resolve(unflow(source, dir))
}

recursiveScan(source, unflowAsync)