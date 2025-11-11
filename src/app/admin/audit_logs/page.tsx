import { MetadataPageWrapper } from '@/components/metadata-page-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AuditLogsPage() {
  return (
    <MetadataPageWrapper>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6" />
            <h2 className="text-2xl font-bold">감사 로그</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="로그 검색..."
                className="pl-9 w-[300px]"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">전체 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total audit logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">오늘</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Today's logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">경고</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">오류</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">0</div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log List */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동 로그</CardTitle>
            <CardDescription>
              시스템의 모든 활동이 기록됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample log entries */}
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge>CREATE</Badge>
                    <span className="font-medium">menu_items</span>
                    <span className="text-sm text-muted-foreground">ID: 133</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    New menu item created
                  </p>
                  <div className="text-xs text-muted-foreground">
                    By: admin • Just now
                  </div>
                </div>
              </div>

              <div className="text-center text-muted-foreground py-8">
                더 많은 로그를 불러오는 중...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MetadataPageWrapper>
  )
}
