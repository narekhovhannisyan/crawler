const fs = require('fs')
const flowRemoveTypes = require('flow-remove-types')
const path = require('path')
const Promise = require('bluebird')

const source = './src'

const recursiveScan = (source, processor) => {
  const process = dir => {
    if (fs.statSync(path.join(source, dir)).isDirectory()) {
      console.log('dir', path.join(source, dir))
      return processor(path.join(source, dir), dir).then(() => {
        return recursiveScan(path.join(source, dir), processor)
      })
    } else if (fs.statSync(path.join(source, dir)).isFile()) {
      console.log('file', path.join(source, dir))
      return processor(path.join(source, dir), dir)
    } else {
      return Promise.reject(Error('something wrong with the directory'))
    }
  }
  const dirs = fs.readdirSync(source)
  return Promise.map(dirs, process)
}

const removeFlowTypes = (source, target) => {
  /* if source is modified, then change file, otherwise do nothing! */
  if (checkLastModifiedDate(target) < checkLastModifiedDate(source)) {
    const input = fs.readFileSync(source, 'utf8')
    const output = flowRemoveTypes(input)
    fs.writeFileSync(target, output.toString())
  }
}

const copyFile = (source, target) => {
  /* if source is modified, then copy file, otherwise do nothing! */
  return new Promise(resolve => {
    if (checkLastModifiedDate(target) < checkLastModifiedDate(source)) {
      const readable = fs.createReadStream(source)
      readable.pipe(fs.createWriteStream(target))
      readable.on('end', () => {
        resolve()
      })
    } else {
      resolve()
    }
  })
}

const createDirectory = target => {
  return fs.mkdirSync(target)
}

const dirExists = path => {
  return fs.existsSync(path)
}

const checkLastModifiedDate = source => {
  return dirExists(source) ? new Date(fs.statSync(source).mtime) : 0
}

const unflow = (source, dir) => {
  const target = source.replace('src', 'dist')
  const ext = '.js'
  return Promise.resolve().then(() => {
    // if (!fs.existsSync(target)) {
    //   createDirectory(target)
    // }
    if (fs.statSync(source).isDirectory()) {
      /* cheking if source firectory exists in destination directory otherwise do nothing */
      if (!fs.existsSync(target)) {
        return createDirectory(target)
      }
    } else if (fs.statSync(source).isFile() && path.extname(source) == ext) {
      return removeFlowTypes(source, target)
    } else {
      return copyFile(source, target)
    }
  })
}

const unflowAsync = (source, dir) => {
  return unflow(source, dir)
}

console.time('takes')
recursiveScan(source, unflowAsync).then(() => console.timeEnd('takes'))
