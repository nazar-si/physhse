import type { NextPage } from 'next'
import Selector from '../../components/Selector/selector'
import Panel from '../../components/Panel/panel'
import style from "../../styles/other.module.scss"
import { Accordion, Divider } from '@mantine/core'

const index : NextPage = () => {
  return (
    <>
    <div className={style.columns}>
    <div>
      <Selector></Selector>
        <Divider my="sm"/>
        </div>
      {/* <div className={style.side}>
        <Panel>
        </Panel>
        <Divider my="sm"/>
      </div> */}
    </div>
    </>)
}

export default index;