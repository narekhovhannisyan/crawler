const fs = require('fs')
const flowRemoveTypes = require('flow-remove-types')
const path = require('path')
const Promise = require('bluebird')
const source = './flow'


// const recursiveScan1212 = (ext, processor) => file => {
//   if (fs.statSync(path.join(_source, file)).isDirectory()) {
//     if (!fs.existsSync(path.join(_target, file))) {
//     fs.mkdirSync(path.join(_target, file))
//       console.log('way 1')
//       return processFile(path.join(_source, file), path.join(_target, file))
//     } else {
//       console.log('way 2')
//     return recursiveScan(path.join(_source, file), path.join(_target, file))

//     //}
//   } else {
//     console.log('creating file')
//     if (fs.statSync(path.join(_source, file)).isFile() && path.extname(path.join(_source, file)) == ext) {
//       processor(_source, _target, file)
//     } else {
//       console.log('other format, just copying file')
//       const input = fs.readFileSync(path.join(_source, file), 'utf8')
//       fs.writeFileSync(path.join(_target, file), input.toString())
//     }
//   }
// }


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


// const unflowSync = (_source, _target) => {
//   fs.readdirSync(_source).forEach(file => {
//     if (fs.statSync(path.join(_source, file)).isDirectory()) {
//       if (!fs.existsSync(path.join(_target, file))) {
//       fs.mkdirSync(path.join(_target, file))
//         console.log('way 1')
//         return unflowSync(path.join(_source, file), path.join(_target, file))
//       } else {
//         console.log('way 2')
//         return unflowSync(path.join(_source, file), path.join(_target, file))
//       }
//     } else {
//       console.log('creating file')
//       if (fs.statSync(path.join(_source, file)).isFile() && path.extname(path.join(_source, file)) == ext) {
//         console.log('found javascript file')
//         const input = fs.readFileSync(path.join(_source, file), 'utf8')
//         const output = flowRemoveTypes(input)
//         fs.writeFileSync(path.join(_target, file), output.toString())
//       } else {
//         console.log('other format, just copying file')
//         const input = fs.readFileSync(path.join(_source, file), 'utf8')
//         fs.writeFileSync(path.join(_target, file), input.toString())
//       }
//     }
//   })
// }
