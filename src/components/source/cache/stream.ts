import { Observable, Scheduler } from 'rxjs'
import { ComponentSource, PublicationComponent, Component, ComponentModel } from '../interfaces'
import { AbstractComponentSource } from '../abstract'
import { KioComponent, KioPublicationComponent, KioStructureComponent, KioComponentType, ComponentType } from '../../interfaces'
import { createWithData } from '../../create'
import * as logger from '../../../console'

import { dasherize } from '../../../utils/string'

import { path, KIO_PROJECT_CACHE, KIO_PROJECT_ROOT, KIO_PATHS } from '../../../env'
import { readdir, readfile } from '../../../utils/rx/fs'
import * as rxfs from '../../../utils/rx/fs'


const logMap = (value,idx)=>{
   console.log('value %s',idx,value)
   return value
 }

const KioComponentType2Path = {
  [KioComponentType.PublicationComponent]: 'publication',
  [KioComponentType[KioComponentType.PublicationComponent]]: 'publication',
  [KioComponentType.NavigationComponent]: 'navigation',
  [KioComponentType[KioComponentType.NavigationComponent]]: 'navigation',
  [KioComponentType.StructureComponent]: 'structure',
  [KioComponentType[KioComponentType.StructureComponent]]: 'structure'
}


const COMPONENTS_CACHE = path.join(KIO_PROJECT_CACHE, 'components')

const resolveComponentsCache = ( componentType:KioComponentType|string, ...args:string[] ) => {
  return path.join(COMPONENTS_CACHE, KioComponentType2Path[componentType],...args)
}

export const fetch = () => readdir(path.join(KIO_PROJECT_CACHE,'components'))
           .filter(item => path.extname(item) === '.json' )
           .distinct(item=>`${item}`)
           .mergeMap( filename => {
               //logger.log('merge map file "%s"', filename )
               return readfile(filename,true)
                      .map(value => ({
                          filename ,
                          data: JSON.parse(value)
                        }) 
                      )
             } )


export class CacheStream extends AbstractComponentSource {

  isWritable=true

  sourcePathForName ( pathname:string ) {
    return path.join ( KIO_PROJECT_CACHE, pathname )
  }

  exists(name:string="components"){
    return rxfs.existsSync(path.join(KIO_PROJECT_CACHE,name))
  }

  normalizeName ( componentName:string ):string {
    return componentName.replace('.'+path.extname(componentName),'')
  }

  private cachedFetch:Observable<any>

  private _fetch(){
    if ( !this.cachedFetch )
    {
      this.cachedFetch  = fetch()
    }
    return this.cachedFetch
  }

  protected removeDeleted(){
    const filtered = this._fetch().filter( (item,idx) => {
      return !rxfs.existsSync(item.data.dir)
    } )

    return filtered.mergeMap((item,idx) => {
      //logger.log('item #%s', idx)
      //return rxfs.unlink(item.filename).map ( () => item )
      return Observable.of(item)
    })
  }
  
  protected fetchExisting():Observable<ComponentModel>{
    return this.removeDeleted().mergeMap ( items => {
      console.log('removed deleted items',items)
      return this._fetch().filter( item => {
        return !!rxfs.existsSync(item.data.dir)
      }).map(item => createWithData(item.data))
    } )
  }

  protected processCachedComponent(componentData){
    if ( !rxfs.existsSync(componentData.data.dir) && !componentData.deleted )
    {
      logger.log("Component %s does not exist", componentData.filename)
      return rxfs.unlink(componentData.filename).map ( value => {
        return {
          ...componentData,
          deleted: true
        }
      } )
    }
    return Observable.of(createWithData(componentData.data))
  }
  
  readComponentAtPath ( filepath:string ):Observable<ComponentModel> {
    return readfile(path.join(KIO_PROJECT_CACHE,'components',filepath+'.json'),true)
        .map ( content => JSON.parse(content) )
        .map ( data => createWithData(data) )
  }

  fetch():Observable<ComponentModel> {
    return fetch().flatMap ( item => {
      return this.processCachedComponent(item) 
    },1)
    /*return fetch().filter( item => {
        return !!rxfs.existsSync(item.data.dir)
      } )
    .map ( item => item.data )
    .map ( createWithData )
    .flatMap ( component => Observable.of(component,Scheduler.async) )
    .concat()*/
  }

  scan(pathname:string):Observable<string> {
    //const targetPath:string = KIO_PATHS.components[pathname]
    //logger.log('scanning cache path: "%s"', pathname)
    const targetPath:string = path.join(KIO_PROJECT_CACHE,'components',pathname)
    return rxfs.findFiles(targetPath)
      .map ( file => path.relative(targetPath,file).replace(/\.json$/,'') ) 
      .filter ( file => file && /^\./.test(file) === false )
      .catch ( error => {
        console.error(error)
        return Observable.of([])
      } )
      //.map ( filepath => path.relative ( targetPath, filepath ) )
      //.map ( logMap )
      //.map ( filepath => path.basename(filepath,'.json') )
      //.filter ( filepath => /^\./.test(filepath) === false && ['src','fragment','txt'].indexOf(filepath) === -1 )
      .distinct()
  }

  prepare():Observable<boolean> {
    return Observable.of(false)
  }

  deleteComponent(component:Component):Observable<boolean>{
    const cacheDir = resolveComponentsCache(component.typeName)
    const cachePath = resolveComponentsCache(component.typeName, component.name+'.json')
    const exists = rxfs.existsSync(cachePath)
    let source = Observable.of(false)
    if ( exists )
    {
      source = rxfs.unlink(cachePath)
    }
    return source
  }

  write(component:PublicationComponent|Component):Observable<string>{
    const cacheDir = (component instanceof PublicationComponent 
              ? resolveComponentsCache(component.typeName, component.contentType)
              : resolveComponentsCache(component.typeName))

    const cachePath = path.join(cacheDir, dasherize(component.name)+'.json')

    const jsonData = component.toJSON()
    const data = JSON.stringify(jsonData,null,'  ')

    const exists = rxfs.existsSync(cacheDir)
    let source = Observable.of(cachePath)
    if ( !exists )
    {
      source = Observable.fromPromise(rxfs.async.mkdir(cacheDir,true).then ( () => cachePath ))
    }
    logger.log('Writing cache for "%s" at %s', component, path.relative(KIO_PROJECT_ROOT,cachePath)  )
    return source.flatMap(filepath => rxfs.writeFile( cachePath, data ) )
  }
}

export default new CacheStream()