import type { NextPage } from "next";
import { useContext } from "react";
import { UserContext } from "../../lib/context";
import Selector from "../../components/Selector/selector";
import Panel from "../../components/Panel/panel";
import style from "../../styles/other.module.scss";
import { Accordion, Divider, Text, Button } from "@mantine/core";
import Head from "next/head";
import { Tabs } from "@mantine/core";
import { GitFork, Stack2, Refresh } from "tabler-icons-react";
import {
    DataGrid,
    GridRowsProp,
    GridColDef,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import depart from "../../public/departments.json";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../lib/firebase";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import Link from "next/link";
import axios from "axios";

export async function getStaticProps() {
    const querySnapshot = await getDocs(collection(firestore, "courses"));
    const courses = [] as any[];
    querySnapshot.forEach((doc) => {
        let data = doc.data();
        data.created = data.created.toDate().toJSON();
        courses.push(data);
    });
    courses.sort((a: any, b: any) => {
        return a.deleted < b.deleted ? -1 : 1;
    });
    return {
        props: {
            data: courses,
        },
        revalidate: 1800,
    };
}

const localeText = {
    columnMenuLabel: "Меню",
    columnMenuShowColumns: "Показать колонки",
    columnMenuFilter: "Фильтр",
    columnMenuHideColumn: "Скрыть",
    columnMenuUnsort: "Отменить сортировку",
    columnMenuSortAsc: "Сортировать по возрастанию",
    columnMenuSortDesc: "Сортировать по убыванию",
    footerRowSelected: (count: number) =>
        `${count.toLocaleString()} строка выбрана`,
};

const rowsDepart: GridRowsProp = depart.map((d: any) => {
    return {
        id: d.num,
        name: d.name,
        fullName: d.fullName,
        subject: d.subject,
    };
});

const columnsDepart: GridColDef[] = [
    { field: "fullName", editable: true, headerName: "Название", width: 400 },
    { field: "name", editable: true, headerName: "Аббревиатура", width: 150 },
    {
        field: "subject",
        editable: true,
        headerName: "Предмет изучения",
        width: 300,
    },
];

type Props = {
    data: any;
};

const Admin: NextPage<Props> = ({ data }) => {
    const { user, username, role } = useContext(UserContext);
    const rowsCourses: GridRowsProp = data.map((d: any) => {
        return {
            id: d.token,
            token: [d.year, d.token],
            name: d.name,
            year: d.year,
            half: d.half,
            state: d.deleted ? "Скрыт" : "Активен",
            editedBy: d.editedBy,
            created: dayjs(d.created).locale("ru").format("D MMM YYYY, HH:mm"),
        };
    });
    const columnsCourses: GridColDef[] = [
        { field: "name", headerName: "Название", width: 300 },
        {
            field: "token",
            headerName: "Токен",
            width: 100,
            renderCell: (params: GridRenderCellParams<any>) => (
                <Link href={`/courses/${params.value[1]}`}>
                    {"/" + params.value[1]}
                </Link>
            ),
        },
        { field: "state", headerName: "Статус", width: 85 },
        { field: "year", headerName: "Курс", width: 50 },
        { field: "half", headerName: "Семестр", width: 80 },
        { field: "editedBy", headerName: "Редактировал", width: 150 },
        { field: "created", headerName: "Последнее изменение", width: 200 },
    ];
    return (
        <>
            <Head>
                <title>Управление</title>
            </Head>
            {user ? (
                <>
                    <div>
                        <Panel padding={0}>
                            <Tabs>
                                <Tabs.Tab
                                    label="Курсы"
                                    icon={
                                        <Stack2 size={16} strokeWidth={1.5} />
                                    }
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            height: "100%",
                                            width: "100%",
                                        }}
                                    >
                                        <div style={{ flexGrow: 1 }}>
                                            <DataGrid
                                                autoHeight
                                                rows={rowsCourses}
                                                columns={columnsCourses}
                                                rowHeight={40}
                                                localeText={localeText}
                                                disableSelectionOnClick
                                                sx={{
                                                    "& .theme-faded": {
                                                        backgroundColor:
                                                            "#f0f0f0",
                                                        color: "#999",
                                                    },
                                                }}
                                                getRowClassName={(params) =>
                                                    `theme-${
                                                        params.row.state ==
                                                        "Скрыт"
                                                            ? "faded"
                                                            : "normal"
                                                    }`
                                                }
                                            />
                                        </div>
                                    </div>
                                </Tabs.Tab>
                                <Tabs.Tab
                                    label="Кафедры"
                                    icon={
                                        <GitFork size={16} strokeWidth={1.5} />
                                    }
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            height: "100%",
                                            width: "100%",
                                        }}
                                    >
                                        <div style={{ flexGrow: 1 }}>
                                            <DataGrid
                                                autoHeight
                                                disableSelectionOnClick
                                                rows={rowsDepart}
                                                columns={columnsDepart}
                                                rowHeight={40}
                                                localeText={localeText}
                                            />
                                        </div>
                                    </div>
                                </Tabs.Tab>
                                <Tabs.Tab
                                    label="Ревалидация"
                                    icon={
                                        <Refresh size={16} strokeWidth={1.5} />
                                    }
                                >
                                    <div
                                        style={{ padding: "0 1rem 1rem 1rem" }}
                                    >
                                        <Text color="gray">
                                            Ревалидация позволяет вызвать
                                            обновление заданной страницы при
                                            изменении данных в БД.
                                        </Text>
                                        <Divider m="sm"></Divider>
                                        <Button
                                            onClick={() => {
                                                axios.post("/api/revalidate", {
                                                    url: "/other/admin",
                                                });
                                            }}
                                            variant="outline"
                                        >
                                            Страница управления
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                axios.post("/api/revalidate", {
                                                    url: "/c1",
                                                });
                                            }}
                                            variant="outline"
                                            ml="sm"
                                        >
                                            Страница первого курса
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                axios.post("/api/revalidate", {
                                                    url: "/c2",
                                                });
                                            }}
                                            variant="outline"
                                            ml="sm"
                                        >
                                            Страница второго курса
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                axios.post("/api/revalidate", {
                                                    url: "/courses",
                                                });
                                            }}
                                            variant="outline"
                                            ml="sm"
                                        >
                                            Общая страница курсов
                                        </Button>
                                    </div>
                                </Tabs.Tab>
                            </Tabs>
                        </Panel>
                    </div>
                </>
            ) : (
                <Panel
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        maxWidth: "500px",
                        alignSelf: "center",
                        margin: "auto",
                    }}
                >
                    <Text align="center">
                        Данная страница доступна только редакторам{" "}
                    </Text>
                    <Link passHref href="/login">
                        <Button mt="md">Перейти ко входу</Button>
                    </Link>
                </Panel>
            )}
        </>
    );
};

export default Admin;
