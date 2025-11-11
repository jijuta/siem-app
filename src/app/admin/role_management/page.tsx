import { MetadataPageWrapper } from '@/components/metadata-page-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Shield } from 'lucide-react'

export default function RoleManagementPage() {
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      nameKo: '관리자',
      description: '시스템 전체 관리 권한',
      users: 0,
      permissions: 132,
      color: 'bg-red-600'
    },
    {
      id: 'manager',
      name: 'Manager',
      nameKo: '매니저',
      description: '일반 관리 권한',
      users: 0,
      permissions: 128,
      color: 'bg-blue-600'
    },
    {
      id: 'analyst',
      name: 'Analyst',
      nameKo: '분석가',
      description: '분석 및 모니터링 권한',
      users: 0,
      permissions: 20,
      color: 'bg-green-600'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      nameKo: '조회자',
      description: '읽기 전용 권한',
      users: 0,
      permissions: 11,
      color: 'bg-gray-600'
    }
  ]

  return (
    <MetadataPageWrapper>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h2 className="text-2xl font-bold">역할 목록</h2>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 역할 추가
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${role.color}`} />
                    {role.nameKo}
                  </CardTitle>
                  <Badge variant="outline">{role.id}</Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">사용자</span>
                    <span className="font-semibold">{role.users}명</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">권한</span>
                    <span className="font-semibold">{role.permissions}개</span>
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    수정
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    상세
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Management Info */}
        <Card>
          <CardHeader>
            <CardTitle>역할 관리 안내</CardTitle>
            <CardDescription>
              역할별 권한 설정은 메뉴 관리 페이지에서 가능합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>각 역할은 메뉴별 접근 권한을 가집니다</li>
              <li>역할은 사용자에게 할당되어 시스템 접근을 제어합니다</li>
              <li>관리자는 메뉴 관리에서 역할별 권한을 설정할 수 있습니다</li>
              <li>권한 변경 사항은 즉시 적용됩니다</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MetadataPageWrapper>
  )
}
