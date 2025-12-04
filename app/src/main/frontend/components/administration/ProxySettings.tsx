import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardHeader,
  Switch,
  Input,
  Button,
  Select,
  SelectItem,
  Divider,
} from '@heroui/react';
import { ProxyEndpoint } from 'Frontend/generated/endpoints';
import type ProxyConfigDto from 'Frontend/generated/org/gameyfin/app/proxy/dto/ProxyConfigDto';
import type ProxyTestResult from 'Frontend/generated/org/gameyfin/app/proxy/dto/ProxyTestResult';
import ProxyType from 'Frontend/generated/org/gameyfin/app/proxy/entities/ProxyType';

export default function ProxySettings() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ProxyConfigDto>({
    id: 0,
    enabled: false,
    type: ProxyType.HTTP,
    host: '',
    port: 0,
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ProxyTestResult | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await ProxyEndpoint.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load proxy config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      await ProxyEndpoint.saveConfig(config);
      setSaveMessage({ type: 'success', text: t('proxy.saveSuccess') });
      // Reload config to get updated values
      await loadConfig();
    } catch (error) {
      console.error('Failed to save proxy config:', error);
      setSaveMessage({ type: 'error', text: t('proxy.saveFailed') });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const result = await ProxyEndpoint.testConnection(config);
      setTestResult(result);
    } catch (error) {
      console.error('Failed to test proxy connection:', error);
      setTestResult({
        success: false,
        message: t('proxy.testFailed'),
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-default-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex flex-col items-start gap-2">
        <h2 className="text-2xl font-bold">{t('proxy.title')}</h2>
        <p className="text-sm text-default-500">{t('proxy.description')}</p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-6">
        {/* Enable Proxy Switch */}
        <Switch
          isSelected={config.enabled}
          onValueChange={(enabled) => setConfig({ ...config, enabled })}
        >
          {t('proxy.enabled')}
        </Switch>

        {/* Proxy Type */}
        <Select
          label={t('proxy.type')}
          selectedKeys={[config.type]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as ProxyType;
            setConfig({ ...config, type: selected });
          }}
          isDisabled={!config.enabled}
        >
          {Object.values(ProxyType).map((type) => (
            <SelectItem key={type}>
              {t(`proxy.types.${type}`)}
            </SelectItem>
          ))}
        </Select>

        {/* Host and Port */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label={t('proxy.host')}
              placeholder={t('proxy.hostPlaceholder')}
              value={config.host}
              onValueChange={(host) => setConfig({ ...config, host })}
              isDisabled={!config.enabled}
            />
          </div>
          <Input
            label={t('proxy.port')}
            placeholder={t('proxy.portPlaceholder')}
            type="number"
            value={config.port?.toString() || ''}
            onValueChange={(port) => setConfig({ ...config, port: parseInt(port) || 0 })}
            isDisabled={!config.enabled}
          />
        </div>

        {/* Username and Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('proxy.username')}
            value={config.username || ''}
            onValueChange={(username) => setConfig({ ...config, username })}
            isDisabled={!config.enabled}
          />
          <Input
            label={t('proxy.password')}
            type="password"
            value={config.password || ''}
            onValueChange={(password) => setConfig({ ...config, password })}
            isDisabled={!config.enabled}
          />
        </div>

        {/* Test Connection Button */}
        <div className="flex flex-col gap-3">
          <Button
            color="secondary"
            variant="flat"
            onPress={handleTest}
            isLoading={testing}
            isDisabled={!config.enabled || !config.host || !config.port}
          >
            {testing ? t('proxy.testing') : t('proxy.testConnection')}
          </Button>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg ${
                testResult.success
                  ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                  : 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400'
              }`}
            >
              <div className="font-medium">
                {testResult.success ? '✓ ' + t('proxy.testSuccess') : '✗ ' + t('proxy.testFailed')}
              </div>
              <div className="text-sm mt-1">{testResult.message}</div>
              {testResult.responseTime && (
                <div className="text-sm mt-1">
                  {t('proxy.responseTime')}: {testResult.responseTime} {t('proxy.milliseconds')}
                </div>
              )}
            </div>
          )}
        </div>

        <Divider />

        {/* Save Button */}
        <div className="flex flex-col gap-3">
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={saving}
          >
            {t('common.save')}
          </Button>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={`p-3 rounded-lg ${
                saveMessage.type === 'success'
                  ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                  : 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400'
              }`}
            >
              {saveMessage.text}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
