"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ConstructionView } from "@/components/ui/ConstructionView";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function RolesPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="角色管理 | ROLE MANAGEMENT" description="管理用户角色与权限配置 | Manage user roles and permissions" />
      
      <ConstructionView 
        icon={faUserGroup}
        title="角色模块开发中"
        label="ROLE MODULE DEVELOPMENT"
        description="该页面将用于配置角色属性、关系以及权限设置。系统正在构建核心权限矩阵。"
      />
    </div>
  );
}
