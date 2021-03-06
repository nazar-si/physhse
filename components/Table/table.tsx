import { FunctionComponent, ReactNode } from "react";
import style from "./style.module.scss";
import Link from "next/link";
import classNames from "classnames";
import { Plus, X } from "tabler-icons-react";
import { UserContext } from "../../lib/context";
import { useContext, useState } from "react";
import axios from "axios";
import {
    Modal,
    Divider,
    Text,
    TextInput,
    Space,
    Tooltip,
    Textarea,
    Grid,
    Progress,
    SegmentedControl,
    ActionIcon,
    Select,
    MultiSelect,
    NumberInput,
    Group,
    Box,
} from "@mantine/core";
import { At, Forms, InfoCircle } from "tabler-icons-react";
import Button from "../Button/button";
import { ChevronsUp, Pencil, Trash } from "tabler-icons-react";
import Teachers from "../../public/teachers.json";
import DEField from "../DEField/DEField";
import { DatePicker } from "@mantine/dates";
import "dayjs/locale/ru";
import { Button as MButton } from "@mantine/core";
import { useForm, formList } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { firestore, Timestamp } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface entry {
    name: string | null;
    content?: ReactNode;
    link?: string | null;
}

type Props = {
    data: entry[];
    year?: number;
    half?: number;
    top?: boolean;
    bottom?: boolean;
    static?: boolean;
    nolines?: boolean;
};

const Table: FunctionComponent<Props> = (props: Props) => {
    const [data, setData] = useState(props.data);
    const { user, username, role } = useContext(UserContext);
    const [modal, setModal] = useState(false);
    const [progress, setProgress] = useState(0);
    const [name, setName] = useState<string>();
    const [token, setToken] = useState<string>();
    const [tokenError, setTokenError] = useState<string | null>();
    const [depart, setDepart] = useState<string | null>("0");
    const [editYear, setEditYear] = useState<boolean>(false);
    const [year, setYear] = useState(props.year || undefined);
    const [half, setHalf] = useState(props.half || undefined);
    const [teachers, setTeachers] = useState(Teachers);
    const [lecturer, setLecturer] = useState<string | null>();
    const [examDate, setExamDate] = useState<Date | null>(new Date());
    const [examShow, setExamShow] = useState<boolean | null>(true);
    const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
    const [description, setDescription] = useState<
        string | number | readonly string[] | undefined
    >("");
    const [colocNumber, setColocNumber] = useState<number | undefined>();
    const [colocShow, setColocShow] = useState<boolean | null>(true);
    const [controlNumber, setControlNumber] = useState<number | undefined>();
    const [controlShow, setControlShow] = useState<boolean | null>(true);
    const [workNumber, setWorkNumber] = useState<number | undefined>();
    const [workShow, setWorkShow] = useState<boolean | null>(true);
    const [hours, setHours] = useState<number | undefined>();
    const [formula, setFormula] = useState<
        string | number | readonly string[] | undefined
    >();
    const [formulaShow, setFormulaShow] = useState<boolean | null>(true);
    const [finalError, setFinalError] = useState<string | null>();
    const addNew = () => {
        setModal(true);
        setFinalError(null);
        setProgress(33);
    };
    const tokenInput = (val: string | undefined) => {
        let Token = token;
        if (val !== undefined) {
            let s = val.toLowerCase();
            s = s.replace(" ", "-");
            let reg = /^[a-z0-9][a-z0-9\-]*[a-z0-9]*$/;
            if (reg.test(s) || !s) {
                setToken(s);
                Token = s;
            }
        }
        if (Token) {
            let docRef = firestore.collection("courses").doc(Token);

            docRef
                .get()
                .then(function (doc) {
                    if (doc.exists) {
                        setTokenError("?????????? ?????????? ?????? ????????????????????");
                    } else {
                        setTokenError(null);
                    }
                })
                .catch(function (error) {
                    setTokenError("???????????? ?????? ?????????????????? ????????????");
                });
        } else {
            setTokenError(null);
        }
    };

    const tip = (text: string) => (
        <Tooltip
            label={text}
            position="top"
            placement="end"
            width={250}
            wrapLines
        >
            <InfoCircle
                size="1rem"
                style={{ display: "block", opacity: 0.5 }}
            />
        </Tooltip>
    );
    const switchEditYear = () => {
        if (editYear) {
            setYear(props.year);
            setHalf(props.half);
        }
        setEditYear(!editYear);
    };
    const customFields = useForm({
        initialValues: {
            custom: formList([{ title: "", data: "" }]),
        },
    });
    const fields = customFields.values.custom.map((_, index) => (
        <Group mb="sm" key={index}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".5rem",
                }}
            >
                <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => {
                        customFields.reorderListItem("custom", {
                            from: index,
                            to: index - 1,
                        });
                    }}
                    disabled={index == 0}
                >
                    <ChevronsUp size={18} />
                </ActionIcon>
                <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => {
                        customFields.removeListItem("custom", index);
                    }}
                >
                    <Trash size={18} />
                </ActionIcon>
            </div>
            <div style={{ width: "calc(100% - 44px)" }}>
                <TextInput
                    style={{ fontWeight: 600 }}
                    placeholder="????????????????"
                    {...customFields.getListInputProps(
                        "custom",
                        index,
                        "title"
                    )}
                />
                <Textarea
                    autosize
                    minRows={1}
                    maxRows={3}
                    placeholder="???????????????????? ????????"
                    {...customFields.getListInputProps("custom", index, "data")}
                />
            </div>
        </Group>
    ));

    const upperName =
        name?.charAt(0).toUpperCase() + (name ? name.slice(1) : "");
    const reset = () => {
        setDepart("0");
        setYear(props.year);
        setHalf(props.half);
        setLecturer(null);
        setExamDate(new Date());
        setSelectedTeachers([]);
        setDescription("");
        setColocNumber(undefined);
        setControlNumber(undefined);
        setWorkNumber(undefined);
        setHours(undefined);
        setColocShow(true);
        setControlShow(true);
        setWorkShow(true);
        setFormulaShow(true);
        setExamShow(true);
        setFormula("");
        setFinalError(null);
        setProgress(100);
        customFields.reset();
    };
    const createDiscipline = async () => {
        if (name && token) {
            const course = {
                name: name,
                token: token,
                year: year,
                half: half,
                deleted: false,
                created: Timestamp.fromDate(new Date()),
                createdBy: username,
                editedBy: username,
                depart: depart,
            };
            const courseData = {
                coloc: colocNumber ? colocNumber : 0,
                control: controlNumber ? controlNumber : 0,
                work: workNumber ? workNumber : 0,
                formula: formula ? formula : "",
                description: description ? description : "",
                lecturer: lecturer ? teachers[parseInt(lecturer) - 1] : null,
                examDate: Timestamp.fromDate(examDate ? examDate : new Date()),
                teachers: selectedTeachers.map(
                    (id: string) => teachers[parseInt(id) - 1]
                ),
                custom: customFields.values.custom,
                colocShow: colocShow,
                controlShow: controlShow,
                workShow: workShow,
                formulaShow: formulaShow,
                examShow: examShow,
                hours: hours ? hours : 0,
            };
            await setDoc(doc(firestore, "courses", token), course, {
                merge: true,
            })
                .then(() => {
                    setDoc(
                        doc(firestore, `courses/${token}/data`, "info"),
                        courseData,
                        { merge: true }
                    ).then(() => {
                        axios.post("/api/revalidate", {
                            url: "/other/admin",
                        });
                        axios.post("/api/revalidate", {
                            url: `/c${year}`,
                        });
                        axios.post("/api/revalidate", {
                            url: `/c${year}/${token}`,
                        });
                        reset();
                    });
                })
                .catch((err) => {
                    setFinalError("?????? ???????????????? ?????????? ?????????????????? ????????????");
                    const report = {
                        error: err.toString(),
                        course: JSON.stringify(course),
                        courseData: JSON.stringify(courseData),
                        created: Timestamp.fromDate(new Date()),
                        createdBy: username,
                    };
                    setDoc(
                        doc(firestore, "reports", new Date().toString()),
                        report,
                        { merge: true }
                    ).catch((err) => {});
                    setProgress(100);
                });
        }
    };

    return (
        <div className={style.wrapper}>
            <div
                className={classNames(style.table, {
                    [style.top]: props.top,
                    [style.bottom]: props.bottom,
                    [style.static]: props.static,
                    [style.nolines]: props.nolines,
                })}
            >
                {data.map((d) => {
                    if (d.link) {
                        return (
                            <Link
                                key={d.name}
                                passHref
                                href={d.link ? d.link : "#"}
                            >
                                <button
                                    className={classNames(
                                        style.entry,
                                        style.link
                                    )}
                                >
                                    {d.content ? d.content : d.name}
                                </button>
                            </Link>
                        );
                    }
                    return (
                        <div
                            key={d.name}
                            className={classNames(style.entry, {
                                [style.add]: d.name == "<add>",
                            })}
                        >
                            {d.content ? d.content : d.name}
                        </div>
                    );
                })}
                {!data.length && (
                    <div className={style.entry}>
                        <Text color="red">?????? ????????????</Text>
                    </div>
                )}
                {username && !props.static && (
                    <div
                        className={classNames(style.entry, style.add)}
                        onClick={addNew}
                    >
                        <Plus size="1.2rem" strokeWidth={2} />
                    </div>
                )}
            </div>
            <Modal
                opened={modal}
                onClose={() => {
                    setModal(false);
                    setYear(props.year || undefined);
                    setHalf(props.half || undefined);
                }}
                title={progress < 50 ? "???????????????????? ??????????" : upperName}
                centered
                size="md"
                withCloseButton={false}
                overflow="outside"
                transition="pop"
            >
                <Progress value={progress}></Progress>
                {progress == 33 && (
                    <>
                        <Space h="md" />
                        <TextInput
                            label="????????????????"
                            required
                            placeholder="????????????????"
                            icon={<Forms strokeWidth={1.5} />}
                            value={name}
                            onChange={(event) =>
                                setName(event.currentTarget.value)
                            }
                        ></TextInput>
                        <Space h="md" />
                        <TextInput
                            label="URL ??????????"
                            required
                            placeholder="??????????"
                            icon={<At strokeWidth={1.5} />}
                            rightSection={tip(
                                "???????????? ?????????? ?????????? ???????????????????????????? ?????? URL ?????????? ?? ???????????? ???????? ????????????????."
                            )}
                            value={token}
                            onChange={(event) =>
                                tokenInput(event.currentTarget.value)
                            }
                            error={tokenError}
                        ></TextInput>
                        <Space h="md" />
                        <Textarea
                            label="????????????????"
                            placeholder="?????????????? ???????????????? ????????????????????"
                            autosize
                            minRows={2}
                            maxRows={5}
                            value={description}
                            onChange={(e) =>
                                setDescription(e.currentTarget.value)
                            }
                        ></Textarea>
                        <Space h="xs" />
                        <Grid gutter={0} grow>
                            <Grid.Col style={{ padding: ".25rem" }} span={5}>
                                <Text
                                    size="sm"
                                    weight={600}
                                    style={{ marginLeft: "-.25rem" }}
                                >
                                    ??????
                                </Text>
                                <Space h={4} />
                                {/* <NumberInput value={year} onChange={setYear} placeholder="??????"/> */}
                                <SegmentedControl
                                    value={year?.toString()}
                                    onChange={(val) => setYear(parseInt(val))}
                                    color={editYear ? "blue" : "white"}
                                    data={[
                                        { value: "1", label: "1" },
                                        { value: "2", label: "2" },
                                        { value: "3", label: "3" },
                                        { value: "4", label: "4" },
                                    ]}
                                    disabled={!editYear}
                                ></SegmentedControl>
                            </Grid.Col>
                            <Grid.Col style={{ padding: ".25rem" }} span={6}>
                                <Text
                                    size="sm"
                                    weight={600}
                                    style={{ marginLeft: "-.25rem" }}
                                >
                                    ??????????????????
                                </Text>
                                <Space h={4} />
                                {/* <NumberInput value={half} onChange={setHalf} placeholder="??????????????????"/> */}
                                <SegmentedControl
                                    value={half?.toString()}
                                    onChange={(val) => setHalf(parseInt(val))}
                                    color={editYear ? "blue" : "white"}
                                    data={[
                                        { value: "1", label: "????????????" },
                                        { value: "2", label: "????????????" },
                                    ]}
                                    disabled={!editYear}
                                ></SegmentedControl>
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <Space h={13}></Space>
                                <Space h="lg"></Space>
                                <ActionIcon
                                    variant={editYear ? "filled" : "light"}
                                    style={{
                                        transition: ".3s",
                                        background: editYear ? "" : "#0001",
                                    }}
                                    color={editYear ? "blue" : "gray"}
                                >
                                    <Pencil
                                        strokeWidth={1.5}
                                        onClick={switchEditYear}
                                    />
                                </ActionIcon>
                            </Grid.Col>
                        </Grid>
                        {year && year >= 3 && (
                            <>
                                <Space h="md" />
                                <Select
                                    label="??????????????"
                                    value={depart}
                                    onChange={setDepart}
                                    data={[
                                        {
                                            value: "0",
                                            label: "??????",
                                            full: "*|??????????????????????",
                                        },
                                        {
                                            value: "1",
                                            full: "????????",
                                            label: "???????????????? ??????????????????????????",
                                        },
                                        {
                                            value: "2",
                                            full: "??????",
                                            label: "???????????????? ???????????????????? ?????????????? ????. ??.??. ????????????",
                                        },
                                        {
                                            value: "3",
                                            full: "????????",
                                            label: "???????????????? ???????????? ???????????????? ????????",
                                        },
                                        {
                                            value: "4",
                                            full: "??????",
                                            label: "???????????????? ?????????????????????? ????????????????????????",
                                        },
                                        {
                                            value: "5",
                                            full: "??????",
                                            label: "???????????????? ?????????????????????????? ???????????? ????. ??.??. ????????????",
                                        },
                                        {
                                            value: "6",
                                            full: "??????",
                                            label: "???????????????? ?????????? ????????????",
                                        },
                                        {
                                            value: "7",
                                            full: "??????",
                                            label: "???????????????? ??????????????????????",
                                        },
                                        {
                                            value: "8",
                                            full: "??????",
                                            label: "???????????????? ?????????????????????????????? ????????????????????",
                                        },
                                    ]}
                                    placeholder="???????????????? ????????"
                                    searchable
                                    nothingFound="???????????? ???? ??????????????"
                                    filter={(value, item) =>
                                        item.label
                                            ?.toLowerCase()
                                            .includes(
                                                value.toLowerCase().trim()
                                            ) ||
                                        item.full
                                            .toLowerCase()
                                            .includes(
                                                value.toLowerCase().trim()
                                            )
                                    }
                                ></Select>
                            </>
                        )}
                        <Space h="xs" />
                        <Grid gutter={0} grow>
                            <Grid.Col span={1}>
                                <Button
                                    style={{ marginBottom: 0 }}
                                    onClick={() => setProgress(66)}
                                    disabled={
                                        !(name && token) || tokenError != null
                                    }
                                >
                                    ??????????
                                </Button>
                            </Grid.Col>
                            {/* <Grid.Col span={1}>
                        <Button small>
                            F    
                        </Button>
                    </Grid.Col> */}
                        </Grid>
                    </>
                )}
                {progress == 66 && (
                    <>
                        <Space h="md" />
                        <Divider
                            label="?????????????????????????????????? ????????????"
                            labelPosition="center"
                        />
                        <Select
                            creatable
                            label="?????????????? ??????????????????????????"
                            getCreateLabel={(query) => `+ ???????????????? ${query}`}
                            onCreate={(query) => {
                                setTeachers([...teachers, { name: query }]);
                                setLecturer((1 + teachers.length).toString());
                            }}
                            data={teachers.map((t, index) => {
                                return {
                                    value: (index + 1).toString(),
                                    label: t.name,
                                };
                            })}
                            placeholder="??????????????????????"
                            searchable
                            nothingFound="???????????? ???? ??????????????"
                            value={lecturer}
                            onChange={setLecturer}
                        ></Select>
                        <Space h="md" />
                        <MultiSelect
                            creatable
                            label="??????????????????????????"
                            data={teachers.map((t, index) => {
                                return {
                                    value: (index + 1).toString(),
                                    label: t.name,
                                };
                            })}
                            placeholder="?????????????????? ??????????????????????????"
                            searchable
                            nothingFound="???????????? ???? ??????????????"
                            clearButtonLabel="????????????????"
                            getCreateLabel={(query) => `+ ???????????????? ${query}`}
                            onCreate={(query) => {
                                setTeachers([...teachers, { name: query }]);
                                setSelectedTeachers([
                                    ...selectedTeachers,
                                    (1 + teachers.length).toString(),
                                ]);
                            }}
                            value={selectedTeachers}
                            onChange={setSelectedTeachers}
                            clearable
                        ></MultiSelect>
                        <Space h="md" />
                        <Divider
                            label="???????????????? ????????????????????"
                            labelPosition="center"
                        />
                        <Space h="md" />
                        <DEField show={examShow} setShow={setExamShow}>
                            <DatePicker
                                locale="ru"
                                placeholder="???????????????? ????????"
                                label="???????? ????????????????"
                                value={examDate}
                                onChange={setExamDate}
                            />
                        </DEField>
                        <Space h="md" />
                        <DEField show={colocShow} setShow={setColocShow}>
                            <NumberInput
                                min={0}
                                label="??????????????????????"
                                placeholder="???????????????????? ????????????????????????"
                                value={colocNumber}
                                onChange={setColocNumber}
                            ></NumberInput>
                        </DEField>
                        <Space h="xs" />
                        <DEField show={controlShow} setShow={setControlShow}>
                            <NumberInput
                                min={0}
                                label="??????????????????????"
                                placeholder="???????????????????? ??????????????????????"
                                value={controlNumber}
                                onChange={setControlNumber}
                            ></NumberInput>
                        </DEField>
                        <Space h="xs" />
                        <DEField show={workShow} setShow={setWorkShow}>
                            <NumberInput
                                min={0}
                                label="????????????"
                                placeholder="???????????????????? ??????????"
                                value={workNumber}
                                onChange={setWorkNumber}
                            ></NumberInput>
                        </DEField>
                        <Space h="md" />
                        <DEField show={formulaShow} setShow={setFormulaShow}>
                            <TextInput
                                label="?????????????? ????????????"
                                min={0}
                                placeholder="??????????????"
                                value={formula}
                                onChange={(e) =>
                                    setFormula(e.currentTarget.value)
                                }
                            ></TextInput>
                        </DEField>
                        <Space h="md" />
                        <NumberInput
                            label="???????????????????? ??????????"
                            min={0}
                            placeholder="????????"
                            value={hours}
                            onChange={setHours}
                        ></NumberInput>
                        <Space h="md" />
                        <Divider label="???????????????????????????? ????????????????????" />
                        <Space h="md" />
                        <Box sx={{ maxWidth: 500 }} mx="auto">
                            <div>{fields}</div>
                        </Box>
                        <MButton
                            style={{ width: "100%", borderColor: "#ccc" }}
                            variant="light"
                            color="gray"
                            onClick={() =>
                                customFields.addListItem("custom", {
                                    title: "",
                                    data: "",
                                })
                            }
                        >
                            +
                        </MButton>
                        <Space h="xs" />
                        <Grid gutter={0} grow>
                            <Grid.Col span={1}>
                                <Button
                                    style={{ marginBottom: 0 }}
                                    onClick={() => setProgress(33)}
                                >
                                    ??????????
                                </Button>
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <Button
                                    style={{ marginBottom: 0 }}
                                    onClick={createDiscipline}
                                >
                                    ??????????
                                </Button>
                            </Grid.Col>
                        </Grid>
                    </>
                )}
                {progress == 100 && (
                    <>
                        <Space h="lg" />
                        <Text align="center" weight={600}>
                            {upperName} /{" "}
                            <span style={{ color: "#08f" }}>@{token}</span>
                        </Text>
                        {finalError && (
                            <Text align="center" color="red" weight={600}>
                                {finalError}
                            </Text>
                        )}
                        {!finalError && (
                            <Text align="center">
                                ?????????????????????? ?????? ?????????????????? {half}-???? ??????????????????{" "}
                                {year} ??????????{" "}
                            </Text>
                        )}
                        <Space h="xs" />
                        <Grid gutter={0} grow>
                            <Grid.Col span={1}>
                                <Button
                                    style={{ marginBottom: 0 }}
                                    onClick={() => setProgress(66)}
                                >
                                    ??????????
                                </Button>
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <Button
                                    style={{ marginBottom: 0 }}
                                    onClick={() => {
                                        setModal(false);
                                        showNotification({
                                            title: "???????? " + year?.toString(),
                                            message: (
                                                <>
                                                    ?????????????????? ????????????????????{" "}
                                                    <Text weight={600}>
                                                        {name}
                                                    </Text>
                                                </>
                                            ),
                                        });
                                    }}
                                >
                                    ??????????????????????????
                                </Button>
                            </Grid.Col>
                        </Grid>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Table;
