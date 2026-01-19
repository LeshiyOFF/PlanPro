/*******************************************************************************
 * The contents of this file are subject to the Common Public Attribution License 
 * Version 1.0 (the "License"); you may not use this file except in compliance with 
 * the License. You may obtain a copy of the License at 
 * http://www.projectlibre.com/license . The License is based on the Mozilla Public 
 * License Version 1.1 but Sections 14 and 15 have been added to cover use of 
 * software over a computer network and provide for limited attribution for the 
 * Original Developer. In addition, Exhibit A has been modified to be consistent 
 * with Exhibit B. 
 *
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the 
 * specific language governing rights and limitations under the License. The 
 * Original Code is ProjectLibre. The Original Developer is the Initial Developer 
 * and is ProjectLibre Inc. All portions of the code written by ProjectLibre are 
 * Copyright (c) 2012-2019. All Rights Reserved. All portions of the code written by 
 * ProjectLibre are Copyright (c) 2012-2019. All Rights Reserved. Contributor 
 * ProjectLibre, Inc.
 *
 * Alternatively, the contents of this file may be used under the terms of the 
 * ProjectLibre End-User License Agreement (the ProjectLibre License) in which case 
 * the provisions of the ProjectLibre License are applicable instead of those above. 
 * If you wish to allow use of your version of this file only under the terms of the 
 * ProjectLibre License and not to allow others to use your version of this file 
 * under the CPAL, indicate your decision by deleting the provisions above and 
 * replace them with the notice and other provisions required by the ProjectLibre 
 * License. If you do not delete the provisions above, a recipient may use your 
 * version of this file under either the CPAL or the ProjectLibre Licenses. 
 *******************************************************************************/
package com.projectlibre1.ui;

import com.projectlibre1.session.FileHelper;
import javax.swing.JOptionPane;

/**
 * Adapter for UI services - delegates calls through external handler
 * Isolates Core from direct use of Swing/AWT
 */
public class UIServiceAdapter implements UIServicePort {
    
    private static volatile UIServiceAdapter instance;
    private static final Object LOCK = new Object();
    private UIServicePort delegate;
    
    private UIServiceAdapter() {}
    
    public static UIServiceAdapter getInstance() {
        UIServiceAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) instance = result = new UIServiceAdapter();
            }
        }
        return result;
    }
    
    public void setDelegate(UIServicePort delegate) { this.delegate = delegate; }
    
    public boolean hasDelegate() { return delegate != null; }
    
    @Override
    public String chooseFileName(boolean save, String selectedFileName) {
        return delegate != null ? delegate.chooseFileName(save, selectedFileName) : null;
    }
    
    @Override
    public boolean isFileNameAllowed(String fileName, boolean save) {
        return delegate != null ? delegate.isFileNameAllowed(fileName, save) : FileHelper.isFileNameAllowed(fileName, save);
    }
    
    @Override
    public String getFileExtension(String fileName) {
        return delegate != null ? delegate.getFileExtension(fileName) : FileHelper.getFileExtension(fileName);
    }
    
    @Override
    public String changeFileExtension(String fileName, String extension) {
        return delegate != null ? delegate.changeFileExtension(fileName, extension) : FileHelper.changeFileExtension(fileName, extension);
    }
    
    @Override
    public int getFileType(String fileName) {
        return delegate != null ? delegate.getFileType(fileName) : FileHelper.getFileType(fileName);
    }
    
    @Override
    public String getFileExtensionByType(int fileType) {
        return delegate != null ? delegate.getFileExtensionByType(fileType) : FileHelper.getFileExtension(fileType);
    }

    @Override
    public void warn(Object message) { if (delegate != null) delegate.warn(message); }

    @Override
    public void error(Object message) { if (delegate != null) delegate.error(message); }

    @Override
    public int confirm(Object message, int optionType) {
        return delegate != null ? delegate.confirm(message, optionType) : JOptionPane.NO_OPTION;
    }
}
