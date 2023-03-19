import { __extends } from "tslib";
import { KMSClient } from "./KMSClient";
import { CancelKeyDeletionCommand, } from "./commands/CancelKeyDeletionCommand";
import { ConnectCustomKeyStoreCommand, } from "./commands/ConnectCustomKeyStoreCommand";
import { CreateAliasCommand } from "./commands/CreateAliasCommand";
import { CreateCustomKeyStoreCommand, } from "./commands/CreateCustomKeyStoreCommand";
import { CreateGrantCommand } from "./commands/CreateGrantCommand";
import { CreateKeyCommand } from "./commands/CreateKeyCommand";
import { DecryptCommand } from "./commands/DecryptCommand";
import { DeleteAliasCommand } from "./commands/DeleteAliasCommand";
import { DeleteCustomKeyStoreCommand, } from "./commands/DeleteCustomKeyStoreCommand";
import { DeleteImportedKeyMaterialCommand, } from "./commands/DeleteImportedKeyMaterialCommand";
import { DescribeCustomKeyStoresCommand, } from "./commands/DescribeCustomKeyStoresCommand";
import { DescribeKeyCommand } from "./commands/DescribeKeyCommand";
import { DisableKeyCommand } from "./commands/DisableKeyCommand";
import { DisableKeyRotationCommand, } from "./commands/DisableKeyRotationCommand";
import { DisconnectCustomKeyStoreCommand, } from "./commands/DisconnectCustomKeyStoreCommand";
import { EnableKeyCommand } from "./commands/EnableKeyCommand";
import { EnableKeyRotationCommand, } from "./commands/EnableKeyRotationCommand";
import { EncryptCommand } from "./commands/EncryptCommand";
import { GenerateDataKeyCommand, } from "./commands/GenerateDataKeyCommand";
import { GenerateDataKeyPairCommand, } from "./commands/GenerateDataKeyPairCommand";
import { GenerateDataKeyPairWithoutPlaintextCommand, } from "./commands/GenerateDataKeyPairWithoutPlaintextCommand";
import { GenerateDataKeyWithoutPlaintextCommand, } from "./commands/GenerateDataKeyWithoutPlaintextCommand";
import { GenerateRandomCommand, } from "./commands/GenerateRandomCommand";
import { GetKeyPolicyCommand, } from "./commands/GetKeyPolicyCommand";
import { GetKeyRotationStatusCommand, } from "./commands/GetKeyRotationStatusCommand";
import { GetParametersForImportCommand, } from "./commands/GetParametersForImportCommand";
import { GetPublicKeyCommand, } from "./commands/GetPublicKeyCommand";
import { ImportKeyMaterialCommand, } from "./commands/ImportKeyMaterialCommand";
import { ListAliasesCommand } from "./commands/ListAliasesCommand";
import { ListGrantsCommand } from "./commands/ListGrantsCommand";
import { ListKeyPoliciesCommand, } from "./commands/ListKeyPoliciesCommand";
import { ListKeysCommand } from "./commands/ListKeysCommand";
import { ListResourceTagsCommand, } from "./commands/ListResourceTagsCommand";
import { ListRetirableGrantsCommand, } from "./commands/ListRetirableGrantsCommand";
import { PutKeyPolicyCommand, } from "./commands/PutKeyPolicyCommand";
import { ReEncryptCommand } from "./commands/ReEncryptCommand";
import { RetireGrantCommand } from "./commands/RetireGrantCommand";
import { RevokeGrantCommand } from "./commands/RevokeGrantCommand";
import { ScheduleKeyDeletionCommand, } from "./commands/ScheduleKeyDeletionCommand";
import { SignCommand } from "./commands/SignCommand";
import { TagResourceCommand } from "./commands/TagResourceCommand";
import { UntagResourceCommand, } from "./commands/UntagResourceCommand";
import { UpdateAliasCommand } from "./commands/UpdateAliasCommand";
import { UpdateCustomKeyStoreCommand, } from "./commands/UpdateCustomKeyStoreCommand";
import { UpdateKeyDescriptionCommand, } from "./commands/UpdateKeyDescriptionCommand";
import { VerifyCommand } from "./commands/VerifyCommand";
/**
 * <fullname>AWS Key Management Service</fullname>
 *          <p>AWS Key Management Service (AWS KMS) is an encryption and key management web service. This guide describes
 *       the AWS KMS operations that you can call programmatically. For general information about AWS KMS,
 *       see the <a href="https://docs.aws.amazon.com/kms/latest/developerguide/">
 *                <i>AWS Key Management Service Developer Guide</i>
 *             </a>.</p>
 *          <note>
 *             <p>AWS provides SDKs that consist of libraries and sample code for various programming
 *         languages and platforms (Java, Ruby, .Net, macOS, Android, etc.). The SDKs provide a
 *         convenient way to create programmatic access to AWS KMS and other AWS services. For example,
 *         the SDKs take care of tasks such as signing requests (see below), managing errors, and
 *         retrying requests automatically. For more information about the AWS SDKs, including how to
 *         download and install them, see <a href="http://aws.amazon.com/tools/">Tools for Amazon Web
 *           Services</a>.</p>
 *          </note>
 *          <p>We recommend that you use the AWS SDKs to make programmatic API calls to AWS KMS.</p>
 *          <p>Clients must support TLS (Transport Layer Security) 1.0. We recommend TLS 1.2. Clients
 *       must also support cipher suites with Perfect Forward Secrecy (PFS) such as Ephemeral
 *       Diffie-Hellman (DHE) or Elliptic Curve Ephemeral Diffie-Hellman (ECDHE). Most modern systems
 *       such as Java 7 and later support these modes.</p>
 *          <p>
 *             <b>Signing Requests</b>
 *          </p>
 *          <p>Requests must be signed by using an access key ID and a secret access key. We strongly
 *       recommend that you <i>do not</i> use your AWS account (root) access key ID and
 *       secret key for everyday work with AWS KMS. Instead, use the access key ID and secret access key
 *       for an IAM user. You can also use the AWS Security Token Service to generate temporary
 *       security credentials that you can use to sign requests.</p>
 *          <p>All AWS KMS operations require <a href="https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html">Signature Version 4</a>.</p>
 *          <p>
 *             <b>Logging API Requests</b>
 *          </p>
 *          <p>AWS KMS supports AWS CloudTrail, a service that logs AWS API calls and related events for your AWS
 *       account and delivers them to an Amazon S3 bucket that you specify. By using the information
 *       collected by CloudTrail, you can determine what requests were made to AWS KMS, who made the request,
 *       when it was made, and so on. To learn more about CloudTrail, including how to turn it on and find
 *       your log files, see the <a href="https://docs.aws.amazon.com/awscloudtrail/latest/userguide/">AWS CloudTrail User Guide</a>.</p>
 *          <p>
 *             <b>Additional Resources</b>
 *          </p>
 *          <p>For more information about credentials and request signing, see the following:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html">AWS Security
 *             Credentials</a> - This topic provides general information about the types of
 *           credentials used for accessing AWS.</p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html">Temporary
 *             Security Credentials</a> - This section of the <i>IAM User Guide</i>
 *           describes how to create and use temporary security credentials.</p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a href="https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html">Signature Version
 *             4 Signing Process</a> - This set of topics walks you through the process of signing
 *           a request using an access key ID and a secret access key.</p>
 *             </li>
 *          </ul>
 *          <p>
 *             <b>Commonly Used API Operations</b>
 *          </p>
 *          <p>Of the API operations discussed in this guide, the following will prove the most useful
 *       for most applications. You will likely perform operations other than these, such as creating
 *       keys and assigning policies, by using the console.</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <a>Encrypt</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a>Decrypt</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a>GenerateDataKey</a>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <a>GenerateDataKeyWithoutPlaintext</a>
 *                </p>
 *             </li>
 *          </ul>
 */
var KMS = /** @class */ (function (_super) {
    __extends(KMS, _super);
    function KMS() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    KMS.prototype.cancelKeyDeletion = function (args, optionsOrCb, cb) {
        var command = new CancelKeyDeletionCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.connectCustomKeyStore = function (args, optionsOrCb, cb) {
        var command = new ConnectCustomKeyStoreCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.createAlias = function (args, optionsOrCb, cb) {
        var command = new CreateAliasCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.createCustomKeyStore = function (args, optionsOrCb, cb) {
        var command = new CreateCustomKeyStoreCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.createGrant = function (args, optionsOrCb, cb) {
        var command = new CreateGrantCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.createKey = function (args, optionsOrCb, cb) {
        var command = new CreateKeyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.decrypt = function (args, optionsOrCb, cb) {
        var command = new DecryptCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.deleteAlias = function (args, optionsOrCb, cb) {
        var command = new DeleteAliasCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.deleteCustomKeyStore = function (args, optionsOrCb, cb) {
        var command = new DeleteCustomKeyStoreCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.deleteImportedKeyMaterial = function (args, optionsOrCb, cb) {
        var command = new DeleteImportedKeyMaterialCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.describeCustomKeyStores = function (args, optionsOrCb, cb) {
        var command = new DescribeCustomKeyStoresCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.describeKey = function (args, optionsOrCb, cb) {
        var command = new DescribeKeyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.disableKey = function (args, optionsOrCb, cb) {
        var command = new DisableKeyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.disableKeyRotation = function (args, optionsOrCb, cb) {
        var command = new DisableKeyRotationCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.disconnectCustomKeyStore = function (args, optionsOrCb, cb) {
        var command = new DisconnectCustomKeyStoreCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.enableKey = function (args, optionsOrCb, cb) {
        var command = new EnableKeyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.enableKeyRotation = function (args, optionsOrCb, cb) {
        var command = new EnableKeyRotationCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.encrypt = function (args, optionsOrCb, cb) {
        var command = new EncryptCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.generateDataKey = function (args, optionsOrCb, cb) {
        var command = new GenerateDataKeyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.generateDataKeyPair = function (args, optionsOrCb, cb) {
        var command = new GenerateDataKeyPairCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.generateDataKeyPairWithoutPlaintext = function (args, optionsOrCb, cb) {
        var command = new GenerateDataKeyPairWithoutPlaintextCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.generateDataKeyWithoutPlaintext = function (args, optionsOrCb, cb) {
        var command = new GenerateDataKeyWithoutPlaintextCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.generateRandom = function (args, optionsOrCb, cb) {
        var command = new GenerateRandomCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.getKeyPolicy = function (args, optionsOrCb, cb) {
        var command = new GetKeyPolicyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.getKeyRotationStatus = function (args, optionsOrCb, cb) {
        var command = new GetKeyRotationStatusCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.getParametersForImport = function (args, optionsOrCb, cb) {
        var command = new GetParametersForImportCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.getPublicKey = function (args, optionsOrCb, cb) {
        var command = new GetPublicKeyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.importKeyMaterial = function (args, optionsOrCb, cb) {
        var command = new ImportKeyMaterialCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.listAliases = function (args, optionsOrCb, cb) {
        var command = new ListAliasesCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.listGrants = function (args, optionsOrCb, cb) {
        var command = new ListGrantsCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.listKeyPolicies = function (args, optionsOrCb, cb) {
        var command = new ListKeyPoliciesCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.listKeys = function (args, optionsOrCb, cb) {
        var command = new ListKeysCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.listResourceTags = function (args, optionsOrCb, cb) {
        var command = new ListResourceTagsCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.listRetirableGrants = function (args, optionsOrCb, cb) {
        var command = new ListRetirableGrantsCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.putKeyPolicy = function (args, optionsOrCb, cb) {
        var command = new PutKeyPolicyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.reEncrypt = function (args, optionsOrCb, cb) {
        var command = new ReEncryptCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.retireGrant = function (args, optionsOrCb, cb) {
        var command = new RetireGrantCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.revokeGrant = function (args, optionsOrCb, cb) {
        var command = new RevokeGrantCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.scheduleKeyDeletion = function (args, optionsOrCb, cb) {
        var command = new ScheduleKeyDeletionCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.sign = function (args, optionsOrCb, cb) {
        var command = new SignCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.tagResource = function (args, optionsOrCb, cb) {
        var command = new TagResourceCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.untagResource = function (args, optionsOrCb, cb) {
        var command = new UntagResourceCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.updateAlias = function (args, optionsOrCb, cb) {
        var command = new UpdateAliasCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.updateCustomKeyStore = function (args, optionsOrCb, cb) {
        var command = new UpdateCustomKeyStoreCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.updateKeyDescription = function (args, optionsOrCb, cb) {
        var command = new UpdateKeyDescriptionCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    KMS.prototype.verify = function (args, optionsOrCb, cb) {
        var command = new VerifyCommand(args);
        if (typeof optionsOrCb === "function") {
            this.send(command, optionsOrCb);
        }
        else if (typeof cb === "function") {
            if (typeof optionsOrCb !== "object")
                throw new Error("Expect http options but get " + typeof optionsOrCb);
            this.send(command, optionsOrCb || {}, cb);
        }
        else {
            return this.send(command, optionsOrCb);
        }
    };
    return KMS;
}(KMSClient));
export { KMS };
//# sourceMappingURL=KMS.js.map