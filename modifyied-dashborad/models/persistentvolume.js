import { PVC } from '@/config/types';

export const VOLUME_PLUGINS = [
  {
    labelKey:  'persistentVolume.awsElasticBlockStore.label',
    value:     'awsElasticBlockStore',
    supported: true
  },
  {
    labelKey:  'persistentVolume.azureDisk.label',
    value:     'azureDisk',
    supported: true
  },
  {
    labelKey:  'persistentVolume.azureFile.label',
    value:     'azureFile',
    supported: true
  },
  {
    labelKey: 'persistentVolume.cephfs.label',
    value:    'cephfs',
  },
  {
    labelKey: 'persistentVolume.rbd.label',
    value:    'rbd',
  },
  {
    labelKey: 'persistentVolume.csi.label',
    value:    'csi',
  },
  {
    labelKey: 'persistentVolume.fc.label',
    value:    'fc',
  },
  {
    labelKey: 'persistentVolume.flexVolume.label',
    value:    'flexVolume',
  },
  {
    labelKey: 'persistentVolume.flocker.label',
    value:    'flocker',
  },
  {
    labelKey: 'persistentVolume.glusterfs.label',
    value:    'glusterfs',
  },
  {
    labelKey:  'persistentVolume.gcePersistentDisk.label',
    value:     'gcePersistentDisk',
    supported: true
  },
  {
    labelKey:  'persistentVolume.hostPath.label',
    value:     'hostPath',
    supported: true
  },
  {
    labelKey: 'persistentVolume.iscsi.label',
    value:    'iscsi',
  },
  {
    labelKey:  'persistentVolume.local.label',
    value:     'local',
    supported: true
  },
  {
    labelKey:  'persistentVolume.longhorn.label',
    value:     'longhorn',
    supported: true
  },
  {
    labelKey:  'persistentVolume.nfs.label',
    value:     'nfs',
    supported: true
  },
  {
    labelKey: 'persistentVolume.cinder.label',
    value:    'cinder',
  },
  {
    labelKey: 'persistentVolume.photonPersistentDisk.label',
    value:    'photonPersistentDisk',
  },
  {
    labelKey: 'persistentVolume.portworxVolume.label',
    value:    'portworxVolume',
  },

  {
    labelKey: 'persistentVolume.quobyte.label',
    value:    'quobyte',
  },

  {
    labelKey: 'persistentVolume.scaleIO.label',
    value:    'scaleIO',
  },
  {
    labelKey: 'persistentVolume.storageos.label',
    value:    'storageos',
  },
  {
    labelKey:  'persistentVolume.vsphereVolume.label',
    value:     'vsphereVolume',
    supported: true
  },
];

export const LONGHORN_DRIVER = 'driver.longhorn.io';

export const LONGHORN_PLUGIN = VOLUME_PLUGINS.find(plugin => plugin.value === 'longhorn');

export default {
  source() {
    const plugin = this.isLonghorn ? LONGHORN_PLUGIN : VOLUME_PLUGINS.find(plugin => this.spec[plugin.value]);

    return this.t(plugin.labelKey);
  },

  isLonghorn() {
    return this.spec.csi && this.spec.csi.driver === LONGHORN_DRIVER;
  },

  claim() {
    if (!this.name) {
      return null;
    }

    const allClaims = this.$rootGetters['cluster/all'](PVC);

    return allClaims.find(claim => claim.spec.volumeName === this.name);
  },
  canDelete() {
    return this.state !== 'bound';
  },
};
