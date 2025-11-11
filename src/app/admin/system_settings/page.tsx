import { MetadataPageWrapper } from '@/components/metadata-page-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Settings, Save } from 'lucide-react'

export default function SystemSettingsPage() {
  return (
    <MetadataPageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h2 className="text-2xl font-bold">시스템 설정</h2>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            설정 저장
          </Button>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>일반 설정</CardTitle>
            <CardDescription>
              시스템의 기본 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site-name">사이트 이름</Label>
              <Input
                id="site-name"
                placeholder="DeFender X"
                defaultValue="DeFender X"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">사이트 설명</Label>
              <Input
                id="site-description"
                placeholder="차세대 SIEM 플랫폼"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>메뉴 자동 새로고침</Label>
                <p className="text-sm text-muted-foreground">
                  메뉴 변경 시 자동으로 새로고침합니다
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>보안 설정</CardTitle>
            <CardDescription>
              시스템 보안 관련 설정입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">세션 타임아웃 (분)</Label>
              <Input
                id="session-timeout"
                type="number"
                placeholder="30"
                defaultValue="30"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>2단계 인증 필수</Label>
                <p className="text-sm text-muted-foreground">
                  모든 사용자에게 2FA를 요구합니다
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>API 접근 로깅</Label>
                <p className="text-sm text-muted-foreground">
                  모든 API 요청을 로그에 기록합니다
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle>데이터베이스 설정</CardTitle>
            <CardDescription>
              데이터베이스 연결 및 백업 설정입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="db-host">데이터베이스 호스트</Label>
              <Input
                id="db-host"
                placeholder="localhost"
                defaultValue="localhost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-port">포트</Label>
              <Input
                id="db-port"
                type="number"
                placeholder="5432"
                defaultValue="5432"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>자동 백업</Label>
                <p className="text-sm text-muted-foreground">
                  매일 자정에 자동으로 백업합니다
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Cache Settings */}
        <Card>
          <CardHeader>
            <CardTitle>캐시 설정</CardTitle>
            <CardDescription>
              Redis 캐시 설정입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="redis-host">Redis 호스트</Label>
              <Input
                id="redis-host"
                placeholder="localhost"
                defaultValue="localhost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cache-ttl">캐시 TTL (초)</Label>
              <Input
                id="cache-ttl"
                type="number"
                placeholder="300"
                defaultValue="300"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>캐시 활성화</Label>
                <p className="text-sm text-muted-foreground">
                  Redis 캐싱을 활성화합니다
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </MetadataPageWrapper>
  )
}
