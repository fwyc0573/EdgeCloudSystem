import { STORAGE } from '@/config/labels-annotations';
import { STORAGE_CLASS } from '@/config/types';

export const PROVISIONER_OPTIONS = [
  {
    labelKey:  'storageClass.aws-ebs.title',
    value:     'kubernetes.io/aws-ebs',
    supported: true
  },
  {
    labelKey:  'storageClass.azure-disk.title',
    value:     'kubernetes.io/azure-disk',
    supported: true
  },
  {
    labelKey:  'storageClass.azure-file.title',
    value:     'kubernetes.io/azure-file',
    supported: true
  },
  {
    labelKey: 'storageClass.rbd.title',
    value:    'kubernetes.io/rbd',
  },
  {
    labelKey: 'storageClass.glusterfs.title',
    value:    'kubernetes.io/glusterfs',
  },
  {
    labelKey:  'storageClass.gce-pd.title',
    value:     'kubernetes.io/gce-pd',
    supported: true
  },
  {
    labelKey: 'storageClass.no-provisioner.title',
    value:    'kubernetes.io/no-provisioner',
  },
  {
    labelKey:  'storageClass.longhorn.title',
    value:     'driver.longhorn.io',
    supported: true
  },
  {
    labelKey: 'storageClass.cinder.title',
    value:    'kubernetes.io/cinder',
  },
  {
    labelKey: 'storageClass.portworx-volume.title',
    value:    'kubernetes.io/portworx-volume',
  },
  {
    labelKey: 'storageClass.quobyte.title',
    value:    'kubernetes.io/quobyte',
  },
  {
    labelKey: 'storageClass.scaleio.title',
    value:    'kubernetes.io/scaleio',
  },
  {
    labelKey: 'storageClass.storageos.title',
    value:    'kubernetes.io/storageos',
  },
  {
    labelKey:  'storageClass.vsphere-volume.title',
    value:     'kubernetes.io/vsphere-volume',
    supported: true
  }
];

export default {
  provisionerDisplay() {
    const option = PROVISIONER_OPTIONS.find(o => o.value === this.provisioner);

    return option ? this.t(option.labelKey) : this.provisioner;
  },

  isDefault() {
    return this.annotations[STORAGE.DEFAULT_STORAGE_CLASS] === 'true';
  },

  updateDefault() {
    return (value) => {
      this.setAnnotation(STORAGE.DEFAULT_STORAGE_CLASS, value.toString());
      this.setAnnotation(STORAGE.BETA_DEFAULT_STORAGE_CLASS, value.toString());
      this.save();
    };
  },

  setDefault() {
    return () => {
      const allStorageClasses = this.$rootGetters['cluster/all'](STORAGE_CLASS) || [];

      allStorageClasses.forEach(storageClass => storageClass.resetDefault());
      this.updateDefault(true);
    };
  },

  resetDefault() {
    return () => {
      if (this.isDefault) {
        this.updateDefault(false);
      }
    };
  },

  availableActions() {
    const out = this._standardActions;

    if (this.isDefault) {
      out.unshift({
        action:     'resetDefault',
        enabled:    true,
        icon:       'icon icon-fw icon-checkmark',
        label:      this.t('storageClass.actions.resetDefault'),
      });
    } else {
      out.unshift({
        action:     'setDefault',
        enabled:    true,
        icon:       'icon icon-fw icon-checkmark',
        label:      this.t('storageClass.actions.setAsDefault'),
      });
    }

    return out;
  },
};
