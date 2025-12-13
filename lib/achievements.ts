
import { 
    faTrophy, 
    faClock, 
    faCloudUpload, 
    faProjectDiagram, 
    faUserShield, 
    faRocket,
    faLock,
    faIdBadge,
    faPlay,
    faBolt,
    faBoxOpen,
    faBriefcase,
    faDatabase,
    faCalendarCheck,
    faCrown
} from "@fortawesome/free-solid-svg-icons";
import { calculateLevel } from "@/lib/levelUtils";

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: any;
    condition: (data: any, uploads: number, projects: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "INITIATION",
        title: "入职报到",
        description: "首次登录系统",
        icon: faRocket,
        condition: () => true
    },
    {
        id: "IDENTIFIED",
        title: "身份认证",
        description: "设置个人头像",
        icon: faIdBadge,
        condition: (data) => !!data.avatar
    },
    {
        id: "FIRST_STEP",
        title: "迈出一步",
        description: "产生首次活动记录",
        icon: faPlay,
        condition: (data) => data.activities && data.activities.length > 0
    },
    {
        id: "TIME_KEEPER",
        title: "时间管理者",
        description: "累计在线超过1小时",
        icon: faClock,
        condition: (data) => data.totalTime >= 3600
    },
    {
        id: "CONTRIBUTOR",
        title: "初级贡献者",
        description: "上传至少1个资源",
        icon: faCloudUpload,
        condition: (_, uploads) => uploads >= 1
    },
    {
        id: "MANAGER",
        title: "项目经理",
        description: "参与至少1个项目",
        icon: faProjectDiagram,
        condition: (_, __, projects) => projects >= 1
    },
    {
        id: "ACTIVE_AGENT",
        title: "活跃干员",
        description: "累积10条活动记录",
        icon: faBolt,
        condition: (data) => data.activities && data.activities.length >= 10
    },
    {
        id: "CORE_MEMBER",
        title: "核心成员",
        description: "上传超过5个资源",
        icon: faBoxOpen,
        condition: (_, uploads) => uploads >= 5
    },
    {
        id: "VETERAN",
        title: "资深干员",
        description: "累计在线超过10小时",
        icon: faUserShield,
        condition: (data) => data.totalTime >= 36000
    },
    {
        id: "EXECUTIVE",
        title: "执行主管",
        description: "参与超过5个项目",
        icon: faBriefcase,
        condition: (_, __, projects) => projects >= 5
    },
    {
        id: "ARCHIVIST",
        title: "档案管理员",
        description: "上传超过20个资源",
        icon: faDatabase,
        condition: (_, uploads) => uploads >= 20
    },
    {
        id: "DEDICATED",
        title: "全勤模范",
        description: "累计在线超过24小时",
        icon: faCalendarCheck,
        condition: (data) => data.totalTime >= 86400
    },
    {
        id: "LEGEND",
        title: "传奇人物",
        description: "累计在线超过100小时",
        icon: faCrown,
        condition: (data) => data.totalTime >= 360000
    },
    {
        id: "ELITE",
        title: "精英权限",
        description: "达到等级 5",
        icon: faTrophy,
        condition: (data) => calculateLevel(data.totalTime) >= 5
    }
];
