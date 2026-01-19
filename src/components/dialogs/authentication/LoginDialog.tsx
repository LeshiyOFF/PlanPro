import React, { useState, useEffect } from 'react';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/utils/logger';
import { authService, type LoginCredentials } from '@/services/AuthService';
import { 
  LoginDialogData, 
  IDialogActions,
  ValidationRule,
  DialogResult 
} from '@/types/dialog/DialogTypes';
import { Eye, EyeOff, Shield, User } from 'lucide-react';

/**
 * Интерфейс для LoginDialog компонента
 */
export interface LoginDialogProps {
  data?: Partial<LoginDialogData>;
  isOpen: boolean;
  onClose: (result: DialogResult<LoginDialogData>) => void;
}

/**
 * Диалог аутентификации пользователя
 * Соответствует LoginDialog из Dialogs_Inventory.md
 * Реализует SOLID принцип Single Responsibility
 */
export const LoginDialog: React.FC<LoginDialogProps> = ({
  data = {},
  isOpen,
  onClose
}) => {
  const [loginData, setLoginData] = useState<LoginDialogData>({
    id: `login_${Date.now()}`,
    title: 'Вход в систему',
    description: 'Аутентификация пользователя',
    timestamp: new Date(),
    username: '',
    password: '',
    rememberCredentials: false,
    useMenus: true,
    ...data
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Выполнение входа в систему
   */
  const performLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const success = await authenticateUser(username, password);
      
      if (success) {
        logger.info('User login successful', { username });
      } else {
        const errorMessage = 'Неверное имя пользователя или пароль';
        setLoginError(errorMessage);
        logger.error('Login failed', { username, error: errorMessage });
      }
      
      return success;
    } catch (error) {
      const errorMessage = 'Ошибка соединения с сервером аутентификации';
      setLoginError(errorMessage);
      logger.error('Login service error', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Правила валидации полей входа
   */
  const validationRules: ValidationRule[] = [
    {
      field: 'username',
      required: true,
      minLength: 3,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Имя пользователя обязательно';
        }
        if (value.trim().length < 3) {
          return 'Минимальная длина имени - 3 символа';
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
          return 'Имя пользователя содержит недопустимые символы';
        }
        return true;
      }
    },
    {
      field: 'password',
      required: true,
      minLength: 6,
      custom: (value: string) => {
        if (!value) {
          return 'Пароль обязателен';
        }
        if (value.length < 6) {
          return 'Минимальная длина пароля - 6 символов';
        }
        return true;
      }
    }
  ];

  /**
   * Обработчик изменения полей
   */
  const handleFieldChange = (field: string, value: any) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очистка ошибок при изменении полей
    if (loginError) {
      setLoginError('');
    }
  };

  /**
   * Аутентификация пользователя через сервис
   */
  const authenticateUser = async (username: string, password: string): Promise<boolean> => {
    const credentials: LoginCredentials = {
      username,
      password,
      rememberMe: loginData.rememberCredentials
    };

    const response = await authService.login(credentials);
    return response.success;
  };

  /**
   * Сохранение учетных данных
   */
  const saveCredentials = (username: string, password: string) => {
    if (loginData.rememberCredentials) {
      // В реальном приложении здесь будет безопасное хранение
      localStorage.setItem('remembered_username', username);
      // Пароль не сохраняем в localStorage по соображениям безопасности
    } else {
      localStorage.removeItem('remembered_username');
    }
  };

  /**
   * Загрузка сохраненных учетных данных
   */
  const loadCredentials = () => {
    const rememberedUsername = localStorage.getItem('remembered_username');
    if (rememberedUsername) {
      setLoginData(prev => ({
        ...prev,
        username: rememberedUsername,
        rememberCredentials: true
      }));
    }
  };

  /**
   * Действия диалога
   */
  const actions: IDialogActions = {
    onOk: async (data: LoginDialogData) => {
      try {
        const success = await performLogin(data.username, data.password);
        
        if (success) {
          saveCredentials(data.username, data.password);
          logger.info('Login successful for user:', data.username);
          return data;
        } else {
          setLoginError('Неверное имя пользователя или пароль');
          throw new Error('Authentication failed');
        }
      } catch (error) {
        logger.error('Login error:', error);
        throw error;
      }
    },
    
    onCancel: () => {
      logger.info('Login dialog cancelled');
      setLoginError('');
    },
    
    onHelp: () => {
      logger.info('Opening login help...');
      // Открытие справки по входу в систему
    },
    
    onValidate: (data: LoginDialogData) => {
      if (!data.username || data.username.trim().length === 0) {
        return false;
      }
      if (!data.password || data.password.length === 0) {
        return false;
      }
      return true;
    }
  };

  /**
   * Инициализация при монтировании
   */
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setLoginData(prev => ({
        ...prev,
        ...data,
        id: prev.id,
        timestamp: new Date()
      }));
    }
  }, [data]);

  // Загрузка сохраненных учетных данных
  useEffect(() => {
    loadCredentials();
  }, []);

  /**
   * Компонент содержимого диалога
   */
  const DialogContent = (data: LoginDialogData, validationErrors: Record<string, string[]>) => (
    <div className="space-y-6 p-6">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Вход в ПланПро</h3>
        <p className="text-sm text-muted-foreground">
          Введите свои учетные данные для доступа к системе
        </p>
      </div>

      {/* Сообщение об ошибке */}
      {loginError && (
        <Alert variant="destructive">
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      {/* Форма входа */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">
            Имя пользователя *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              value={data.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              placeholder="Введите имя пользователя"
              className={`pl-10 ${validationErrors.username?.length ? 'border-destructive' : ''}`}
              autoFocus
              disabled={isLoading}
            />
          </div>
          {validationErrors.username?.length && (
            <div className="text-sm text-destructive">
              {validationErrors.username[0]}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Пароль *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              placeholder="Введите пароль"
              className={`pr-10 ${validationErrors.password?.length ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {validationErrors.password?.length && (
            <div className="text-sm text-destructive">
              {validationErrors.password[0]}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-credentials"
              checked={data.rememberCredentials}
              onCheckedChange={(checked) => handleFieldChange('rememberCredentials', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="remember-credentials" className="text-sm">
              Запомнить имя пользователя
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-menus"
              checked={data.useMenus}
              onCheckedChange={(checked) => handleFieldChange('useMenus', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="use-menus" className="text-sm">
              Использовать меню быстрого доступа
            </Label>
          </div>
        </div>
      </div>

      {/* Демо-информация */}
      <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
        <div className="font-medium mb-1">Демо-аккаунты:</div>
        <div>• admin / password (администратор)</div>
        <div>• user / user123 (пользователь)</div>
      </div>
    </div>
  );

  return (
    <BaseDialog<LoginDialogData>
      data={loginData}
      actions={actions}
      validationRules={validationRules}
      isOpen={isOpen}
      onClose={onClose}
      config={{
        width: 450,
        height: 550,
        modal: true,
        showHelp: true,
        closeOnEscape: !isLoading,
        closeOnEnter: false
      }}
    >
      {DialogContent}
    </BaseDialog>
  );
};

export default LoginDialog;

