import type { NextPage } from 'next'
import Table from "../components/Table/table"
import Columns from '../components/Columns/columns'
import { Accordion, Divider } from '@mantine/core'
import Panel from '../components/Panel/panel'
import Head from "next/head"


const c2 : NextPage = ()=>{

    return <>
        <Head>
            <title>Курс 1</title>
        </Head>
        <Table top static data={[{name: "Первый семестр"}]}/>
        <Table data={[
            {name: "Математический анализ", link: "/c1/matan"},
            {name: "Математический аппарат"},
            {name: "Линейная алгебра"},
            {name: "Механика"},
            {name: "История"},
        ]}/>
        <Table static data={[{name: "Второй семестр"}]}/>
        <Table bottom data={[
            {name: "Математический анализ"},
            {name: "Аналитические приближенные методы"},
            {name: "Электромагнетизм"},
            {name: "Аналитическая механика"},
            {name: "Питон"},
            {name: "Дифференциальные уравнения"},
        ]}/>
        <Divider my="sm" label="Дополнительно" labelPosition='center'></Divider>
        <Columns cols="20rem" content={[
            <Panel overflow='hidden' padding={0} key="1">
                <Accordion multiple>
                    <Accordion.Item label='Сайты вышки'>В процессе обработки</Accordion.Item>
                    <Accordion.Item label='Расписание'>В процессе обработки</Accordion.Item>
                    <Accordion.Item label='Академические возможности'>В процессе обработки</Accordion.Item>
                </Accordion>
            </Panel>,
            <Panel overflow='hidden' padding={0} key="2">
                <Accordion multiple>
                    <Accordion.Item label='Майноры'>В процессе обработки</Accordion.Item>
                    <Accordion.Item label='Школы'>В процессе обработки</Accordion.Item>
                    <Accordion.Item label='Другие материалы'>В процессе обработки</Accordion.Item>
                </Accordion>
            </Panel>
        ]}/>
    </>
}

export default c2