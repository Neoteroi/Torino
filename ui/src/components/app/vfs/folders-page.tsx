import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import DeleteIcon from "@material-ui/icons/Delete";
import DescriptionIcon from "@material-ui/icons/Description";
import dom from "../../../common/dom";
import ErrorPanel from "../../common/error";
import FolderIcon from "@material-ui/icons/Folder";
import FolderTable from "./folder-table";
import ListIcon from "@material-ui/icons/List";
import Loader from "../../common/loader";
import NewNodeForm from "./new-node-form";
import NodePath from "./node-path";
import React, {Component, ReactElement} from "react";
import SettingsIcon from "@material-ui/icons/Settings";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import {ApplicationError} from "../../../common/errors";
import {DialogSize} from "../../common/dialogs/size";
import {dismissDialog} from "../view-functions";
import {
  CopyOperationInput,
  FileSystemNode,
  FileSystemNodeType,
} from "../../../service/domain/vfs";
import {IServices} from "../../../service/services";
import {SelectOptions} from "../../../common/selections";
import {Button} from "@material-ui/core";
import ConfirmDialog, {
  closedDialog,
  ConfirmDialogProps,
} from "../../common/dialogs/confirm-dialog";
import RenameNodeForm from "./rename-node-form";
import Upload from "../../common/forms/upload";
import {ContainerReadAuth} from "../../../service/domain/blobs";
import FolderGallery from "./folder-gallery";
import {
  getMediumSizeImageURL,
  getOriginalImageURL,
} from "../../../service/domain/images";
import {uniqueId} from "lodash";
import PhotoSwipe from "../../common/media/photoswipe";
import {readStoredOption, storeOption} from "../../../common/memory";
import {Album, AlbumDetails} from "../../../service/domain/albums";
import AlbumSettings from "../albums/album-settings";
import Auth from "../../common/auth";
import {User} from "../../../service/user";
import ErrorDialog from "../../common/dialogs/error-dialog";

export enum ImageSizeMode {
  fullSize,
  reducedSize,
}

export enum FoldersPageView {
  table = "table",
  gallery = "gallery",
}

const IMAGES_FULL_SIZE = "IMAGES_FULL_SIZE";
const VIEW_TYPE = "VIEW_TYPE";

export interface FoldersPageProps {
  albumId: string;
  album: AlbumDetails;
  folderId: string;
  services: IServices;
  auth: ContainerReadAuth;
  onUpdate: (album: Album) => void;
  user: User;
}

export interface PhotoGalleryItem {
  h: number;
  w: number;
  src: string;
  osrc: string;
  fitRatio: number;
  loaded: boolean;
  loading: boolean;
  node_id: string;
}

export interface PhotoGallery {
  next: () => void;
  prev: () => void;
  goTo: (page: number) => void;
  destroy: () => void;
  items: PhotoGalleryItem[];
  currItem: PhotoGalleryItem;
}

export interface FoldersPageState {
  loading: boolean;
  error?: ApplicationError;
  operationError: ApplicationError | null;
  confirm: ConfirmDialogProps;
  viewType: FoldersPageView;
  nodes: FileSystemNode[];
  selectedNodes: FileSystemNode[];
  cutNodes: FileSystemNode[];
  copyNodes: FileSystemNode[];
  imageSizeMode: ImageSizeMode;
}

function viewTypeFromStoredValue(value: string): FoldersPageView {
  switch (value) {
    case "gallery":
      return FoldersPageView.gallery;
    default:
      return FoldersPageView.table;
  }
}

export default class FoldersPage extends Component<
  FoldersPageProps,
  FoldersPageState
> {
  private onGlobalClick: (event: MouseEvent) => void;
  private onGlobalWheel: (event: WheelEvent) => void;
  private onGlobalKeyDown: (event: KeyboardEvent) => void;
  private _firstSelectedNode?: FileSystemNode;
  private _lastSelectedNode?: FileSystemNode;
  private _lastSelectDirection: number;
  private gallery: PhotoGallery | null;
  private _galleryElementId: string;

  constructor(props: FoldersPageProps) {
    super(props);

    const {user} = props;

    this.state = {
      loading: true,
      confirm: closedDialog(),
      viewType: readStoredOption<FoldersPageView>(
        VIEW_TYPE,
        viewTypeFromStoredValue,
        FoldersPageView.table
      ),
      nodes: [],
      selectedNodes: [],
      copyNodes: [],
      cutNodes: [],
      imageSizeMode: readStoredOption<ImageSizeMode>(
        IMAGES_FULL_SIZE,
        (value) =>
          value === "1" ? ImageSizeMode.fullSize : ImageSizeMode.reducedSize,
        ImageSizeMode.reducedSize
      ),
      operationError: null,
    };

    this.load();
    this.gallery = null;
    this._galleryElementId = uniqueId("gallery");
    this._lastSelectDirection = 0;

    this.onGlobalClick = (event: MouseEvent): boolean => {
      const htmlElementTarget = event.target as HTMLElement;
      if (
        event.target === null ||
        htmlElementTarget.tagName === "HTML" ||
        dom.isAnyInput(htmlElementTarget)
      ) {
        return true;
      }
      const table = document.getElementById("table");
      if (table === null) {
        return true;
      }
      if (
        this.hasSelectedNodes &&
        !dom.contains(table as ChildNode, event.target as ChildNode)
      ) {
        this.setState({selectedNodes: []});
      }

      return true;
    };

    this.onGlobalWheel = (event: WheelEvent): void => {
      const gallery = this.gallery;

      if (gallery !== null) {
        if (event.deltaY > 0) {
          gallery.next();
        } else {
          gallery.prev();
        }
      }
    };

    this.onGlobalKeyDown = (event: KeyboardEvent) => {
      const gallery = this.gallery;

      if (gallery !== null) {
        switch (event.key) {
          case "a":
          case "PageUp":
            gallery.prev();
            break;
          case "d":
          case "PageDown":
            gallery.next();
            break;
          case "Home":
            gallery.goTo(0);
            break;
          case "End":
            gallery.goTo(gallery.items.length - 1);
            break;
        }
        return true;
      }

      if (event.ctrlKey && event.key === "a") {
        // Ctrl + A
        if (dom.isAnyInput(event.target as HTMLElement)) {
          return true;
        }
        this.setState({
          selectedNodes: [...this.state.nodes],
        });
        event.preventDefault();
      }

      if (event.key === "Escape") {
        const {confirm} = this.state;

        if (confirm && confirm.open) {
          this.setState({
            confirm: closedDialog(),
          });
          return true;
        }

        if (this.hasSelectedNodes) {
          this.setState({
            selectedNodes: [],
          });
        }
      }

      if (!user.can("UPLOAD")) {
        return true;
      }

      if (event.key === "Delete") {
        this.onDeleteClick();
      }

      if (event.key === "ArrowUp" && event.shiftKey) {
        // extend selection UP
        this.extendSelectionUp();
      }

      if (event.key === "ArrowDown" && event.shiftKey) {
        // extend selection UP
        this.extendSelectionDown();
      }

      if (event.key === "F2") {
        this.onRenameClick();
      }

      if (event.ctrlKey) {
        if (event.key === "x") {
          this.onCut();
        }

        if (event.key === "c") {
          this.onCopy();
        }

        if (event.key === "v") {
          this.onPaste();
        }
      }

      return true;
    };
  }

  onCut(): void {
    // marks all selected nodes in cut mode,
    // if any node is currently in cut mode, they are overridden
    const {selectedNodes} = this.state;

    if (!selectedNodes.length) {
      return;
    }

    this.setState({
      cutNodes: selectedNodes,
      copyNodes: [],
    });
  }

  onCopy(): void {
    const {selectedNodes} = this.state;

    if (!selectedNodes.length) {
      return;
    }

    this.setState({
      cutNodes: [],
      copyNodes: selectedNodes,
    });
  }

  async onPaste(): Promise<void> {
    const {copyNodes, cutNodes} = this.state;

    if (!copyNodes.length && !cutNodes.length) {
      return;
    }

    const source = copyNodes.length ? copyNodes : cutNodes;
    const target_folder_id = this.props.folderId || null;
    const source_folder_id = source[0].parent_id;

    if (target_folder_id === source_folder_id) {
      return;
    }

    this.setState({
      loading: true,
    });

    const input: CopyOperationInput = {
      album_id: this.props.albumId,
      target_parent_id: target_folder_id,
      source_parent_id: source_folder_id,
      nodes: source,
    };

    try {
      let nodes: FileSystemNode[] = [];
      if (cutNodes.length) {
        nodes = await this.props.services.fs.moveNodes(input);
      }

      if (copyNodes.length) {
        nodes = await this.props.services.fs.pasteNodes(input);
      }

      if (nodes.length) this.onNodesAdded(nodes);

      this.setState({
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        operationError: error,
      });
    }
  }

  sortNodes(nodes: FileSystemNode[]): void {
    // TODO: handle special characters, take function from KingTable
    // in GitHub
    nodes.sort((a, b) => {
      const aName = a.name;
      const bName = b.name;
      if (aName > bName) {
        return 1;
      }
      if (aName < bName) {
        return -1;
      }
      return 0;
    });
    nodes.sort((a, b) => {
      const aIsFolder = a.node_type === FileSystemNodeType.folder;
      const bIsFolder = b.node_type === FileSystemNodeType.folder;
      if (aIsFolder && !bIsFolder) {
        return -1;
      }
      if (!aIsFolder && bIsFolder) {
        return 1;
      }
      return 0;
    });
  }

  load(): void {
    const service = this.props.services.albums;

    if (!this.state.loading) {
      this.setState({
        loading: true,
        selectedNodes: [],
      });
    }

    const {albumId, folderId} = this.props;

    service.getAlbumNodes(albumId, folderId).then(
      (data) => {
        this.sortNodes(data);
        this.setState({
          loading: false,
          nodes: data,
        });
      },
      (error: ApplicationError) => {
        this.setState({
          loading: false,
          error,
        });
      }
    );
  }

  setEventListeners(): void {
    document.addEventListener("keydown", this.onGlobalKeyDown);
    document.addEventListener("mousedown", this.onGlobalClick);
    document.addEventListener("wheel", this.onGlobalWheel, {passive: true});
  }

  unsetEventListeners(): void {
    document.removeEventListener("keydown", this.onGlobalKeyDown);
    document.removeEventListener("mousedown", this.onGlobalClick);
    document.removeEventListener("wheel", this.onGlobalWheel);
  }

  componentDidMount(): void {
    this.unsetEventListeners();
    this.setEventListeners();
  }

  componentWillUnmount(): void {
    this.unsetEventListeners();
  }

  componentDidUpdate(props: FoldersPageProps): void {
    if (
      props.albumId !== this.props.albumId ||
      props.folderId !== this.props.folderId
    ) {
      // this happens when the user navigates through folders,
      // note that copied and cut nodes are kept unchanged - which is
      // very convenient to implement copy-paste and cut-paste
      this.load();
    }
  }

  onFolderCreated(node: FileSystemNode): void {
    const {nodes} = this.state;
    nodes.push(node);
    this.sortNodes(nodes);
    this.setState({nodes});
  }

  onNodesAdded(new_nodes: FileSystemNode[]): void {
    const {nodes} = this.state;

    for (const new_node of new_nodes) {
      nodes.push(new_node);
    }
    this.sortNodes(nodes);
    this.setState({nodes, loading: false});
  }

  onItemUpdated(updatedNode: FileSystemNode): void {
    const {nodes, selectedNodes} = this.state;
    const previousNode = nodes.find((item) => item.id === updatedNode.id);

    if (previousNode) {
      const previousNodeIndex = nodes.indexOf(previousNode);
      // TODO: replace the two nodes!
      nodes[previousNodeIndex] = updatedNode;

      if (selectedNodes.indexOf(previousNode) > -1) {
        selectedNodes[selectedNodes.indexOf(previousNode)] = updatedNode;
      }
    }

    this.setState({
      nodes,
      selectedNodes: [],
    });
  }

  onRemoveNode(node: FileSystemNode): void {
    const nodes = [...this.state.nodes];
    const indexOfItem = nodes.indexOf(node);
    if (indexOfItem === -1) {
      return;
    }
    nodes.splice(indexOfItem, 1);
    this.setState({nodes});
  }

  extendSelectionVertical(next: number): void {
    if (!this._lastSelectedNode) return;

    const changeOfDirection = this._lastSelectDirection === -next;
    this._lastSelectDirection = next;

    const {nodes} = this.state;
    const lastSelectedNodeIndex = nodes.indexOf(this._lastSelectedNode);
    let nextNode = nodes[lastSelectedNodeIndex + next];

    if (changeOfDirection) {
      nextNode = this._lastSelectedNode;
    }

    if (nextNode === this._firstSelectedNode) {
      nextNode = nodes[lastSelectedNodeIndex + next * 2];
    }

    if (!nextNode) {
      return;
    }

    this.onSelectNode({
      item: nextNode,
      addToSelection: true,
      expandSelection: false,
    });
  }

  extendSelectionUp(): void {
    this.extendSelectionVertical(-1);
  }

  extendSelectionDown(): void {
    this.extendSelectionVertical(1);
  }

  onDoubleClick(node: FileSystemNode): void {
    if (this.props.user.can("UPLOAD")) {
      this.onRenameClick(node);
    }
  }

  onSelectNode(options: SelectOptions<FileSystemNode>): void {
    if (!this.props.user.can("UPLOAD")) {
      return;
    }

    const node = options.item;

    if (!this._firstSelectedNode) {
      this._firstSelectedNode = node;
    }
    this._lastSelectedNode = node;

    if (options.expandSelection) {
      if (this._firstSelectedNode === node) {
        this._firstSelectedNode = node;
        this.setState({selectedNodes: [node]});
      } else {
        const {nodes} = this.state;
        let fromIndex = nodes.indexOf(this._firstSelectedNode);
        let toIndex = nodes.indexOf(node);

        this._lastSelectDirection = fromIndex > toIndex ? -1 : 1;

        if (fromIndex > toIndex) {
          const _fromIndex = fromIndex;
          fromIndex = toIndex;
          toIndex = _fromIndex;
        }

        toIndex += 1;

        if (fromIndex == -1 || toIndex == -1) {
          // should never happen
          this.setState({selectedNodes: [node]});
          return;
        }

        this.setState({selectedNodes: nodes.slice(fromIndex, toIndex)});
      }
    } else if (options.addToSelection) {
      const selectedNodes = [...this.state.selectedNodes];

      if (selectedNodes.indexOf(node) > -1) {
        selectedNodes.splice(selectedNodes.indexOf(node), 1);
      } else {
        selectedNodes.push(node);
      }
      this.setState({selectedNodes});
    } else {
      this._lastSelectDirection = 0;
      this._firstSelectedNode = node;
      this.setState({selectedNodes: [node]});
    }
  }

  get hasSelectedNodes(): boolean {
    return !!this.state.selectedNodes.length;
  }

  getRootClassName(): string {
    return (
      "folders-page" + (this.state.nodes.length === 0 ? " empty-folder" : "")
    );
  }

  onRenameClick(node?: FileSystemNode): void {
    if (node === undefined) {
      const {selectedNodes} = this.state;

      if (selectedNodes.length !== 1) {
        return;
      }

      node = selectedNodes[0];
    }

    this.setState({
      confirm: {
        open: true,
        title: "Rename",
        size: DialogSize.normal,
        description: "",
        fragment: (
          <RenameNodeForm
            node={node}
            services={this.props.services}
            onCancel={() => {
              dismissDialog(this);
            }}
            onUpdated={(updated: FileSystemNode) => {
              this.onItemUpdated(updated);
              dismissDialog(this);
            }}
          />
        ),
        close: () => {
          //
        },
        confirm: () => {
          //
        },
        noButtons: true,
      },
    });
  }

  onDeleteClick(): void {
    const {nodes, selectedNodes} = this.state;

    if (!selectedNodes.length) {
      return;
    }

    this.setState({
      confirm: {
        open: true,
        title: "Delete selected items",
        description: "This action cannot be undone.",
        size: DialogSize.normal,
        close: () => {
          dismissDialog(this);
        },
        confirm: () => {
          this.setState({
            error: undefined,
            loading: true,
          });
          this.props.services.fs
            .deleteNodes(selectedNodes.map((node) => node.id))
            .then(
              () => {
                this.setState({
                  loading: false,
                  nodes: nodes.filter(
                    (item) => selectedNodes.indexOf(item) === -1
                  ),
                  confirm: closedDialog(),
                  selectedNodes: [],
                });
              },
              (error) => {
                this.setState({
                  error,
                  loading: false,
                });
              }
            );
          return;
        },
      },
    });
  }

  onCreateNewFolderClick(): void {
    const {albumId, folderId} = this.props;

    this.setState({
      confirm: {
        open: true,
        title: "Create a new folder",
        description: "",
        size: DialogSize.normal,
        fragment: (
          <NewNodeForm
            albumId={albumId}
            parentId={folderId}
            services={this.props.services}
            onCancel={() => {
              dismissDialog(this);
            }}
            onCreated={(node: FileSystemNode) => {
              this.onFolderCreated(node);
              dismissDialog(this);
            }}
          />
        ),
        close: () => {
          return;
        },
        confirm: () => {
          return;
        },
        noButtons: true,
      },
    });
  }

  onSettingsClick(): void {
    this.setState({
      confirm: {
        open: true,
        title: "Album settings",
        description: "",
        size: DialogSize.medium,
        fragment: (
          <AlbumSettings
            album={this.props.album}
            services={this.props.services}
            onUpdate={(album: Album) => {
              dismissDialog(this);
              this.props.onUpdate(album);
            }}
            onCancel={() => {
              dismissDialog(this);
            }}
          />
        ),
        close: () => {
          return;
        },
        confirm: () => {
          return;
        },
        noButtons: true,
      },
    });
  }

  renderNodeIcon(node: FileSystemNode): ReactElement {
    if (node.node_type == FileSystemNodeType.folder) {
      return <FolderIcon />;
    }

    return <FolderIcon />;
  }

  onUploadFilesClick(): void {
    this.setState({
      confirm: {
        open: true,
        title: "Upload files",
        description: "",
        size: DialogSize.full,
        fragment: (
          <Upload
            albumId={this.props.albumId}
            folderId={this.props.folderId}
            services={this.props.services}
            onUpload={() => {
              this.load();
            }}
            onCancel={() => {
              dismissDialog(this);
            }}
          />
        ),
        close: () => {
          return;
        },
        confirm: () => {
          return;
        },
        noButtons: true,
      },
    });
  }

  useTableView(): void {
    this.setViewType(FoldersPageView.table);
  }

  useGalleryView(): void {
    this.setViewType(FoldersPageView.gallery);
  }

  setViewType(viewType: FoldersPageView): void {
    this.setState({
      viewType,
    });

    storeOption(VIEW_TYPE, viewType.toString());
  }

  togglePicturesFullSizeMode(): void {
    const {imageSizeMode} = this.state;

    this.setState({
      imageSizeMode:
        imageSizeMode === ImageSizeMode.reducedSize
          ? ImageSizeMode.fullSize
          : ImageSizeMode.reducedSize,
    });

    storeOption(IMAGES_FULL_SIZE, imageSizeMode.toString());
  }

  onImageClick(node: FileSystemNode): void {
    // Initializes and opens PhotoSwipe
    // TODO: pass properties to the PhotoSwipe component (?)
    const {auth} = this.props;
    const {nodes, imageSizeMode} = this.state;
    const PhotoSwipe = (window as any).PhotoSwipe;
    const PhotoSwipeUI_Default = (window as any).PhotoSwipeUI_Default;

    const items = nodes.filter(
      (node) => node.image !== undefined && node.image !== null
    );

    const pswpElement = document.getElementById(this._galleryElementId);
    const galleryItems = items.map((node) => {
      if (node.file_id === null || node.file_extension === null) {
        return;
      }
      const originalSizeImageURL = getOriginalImageURL(node, auth);
      return {
        src:
          imageSizeMode === ImageSizeMode.fullSize
            ? originalSizeImageURL
            : getMediumSizeImageURL(node, auth),
        osrc: originalSizeImageURL,
        w: node.image?.image_width,
        h: node.image?.image_height,
        node_id: node.id,
      };
    });

    const gallery = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      galleryItems,
      {
        index: items.indexOf(node),
        loop: false,
        closeOnScroll: false,
        closeOnVerticalDrag: false,
        hideAnimationDuration: 0,
        shareButtons: [
          {
            id: "download",
            label: "voc.DownloadImage",
            url: "{{raw_image_url}}",
            download: true,
          },
          {
            id: "download-original",
            label: "voc.DownloadOriginalImage",
            url: "{{raw_image_url}}",
            download: true,
          },
        ],
        getImageURLForShare: function (/* shareButtonData: any */) {
          throw "not implemented";
          /*
          let gg = gallery,
            item = gg.currItem;
          switch (shareButtonData.id) {
            case "download":
              return item.src; // medium size picture
            case "download-original":
              return item.osrc;
            default:
              throw "not implemented";
          }
          */
        },
      }
    );

    // disable loop in the gallery, for good
    const baseGoTo = gallery.goTo;
    gallery.goTo = function (next: number) {
      if (next === -1 || next === this.items.length) {
        return;
      }
      baseGoTo.call(this, next);
    };

    // on close, select the current item
    const baseClose = gallery.close;
    gallery.close = () => {
      // set the current item selected
      const current = gallery.currItem;
      if (current) {
        const matchingNode = nodes.find((item) => item.id === current.node_id);

        if (matchingNode) {
          this.onSelectNode({
            item: matchingNode,
            addToSelection: false,
            expandSelection: false,
          });

          dom.scrollIntoViewById(matchingNode.id);
        }
      }
      baseClose.call(gallery);
    };

    this.gallery = gallery;
    (window as any).gallery = gallery;
    gallery.init();
    gallery.listen("destroy", () => {
      this.gallery = null;
    });
  }

  render(): ReactElement {
    const {albumId, auth, folderId, services} = this.props;
    const {
      loading,
      error,
      nodes,
      confirm,
      viewType,
      imageSizeMode,
      selectedNodes,
      cutNodes,
      operationError,
    } = this.state;

    return (
      <div className={this.getRootClassName()}>
        {loading && <Loader className="overlay" />}
        {error && <ErrorPanel error={error} />}
        {operationError && (
          <ErrorDialog
            error={operationError}
            close={() => {
              this.setState({operationError: null});
            }}
          />
        )}
        <div className="folders-control">
          <Button
            title="Table view"
            onClick={() => this.useTableView()}
            className={viewType === FoldersPageView.table ? "selected" : ""}
          >
            <ListIcon />
          </Button>
          <Button
            title="Gallery view"
            onClick={() => this.useGalleryView()}
            className={viewType === FoldersPageView.gallery ? "selected" : ""}
          >
            <ViewModuleIcon />
          </Button>
          <Button
            title="Display pictures in their original size in gallery"
            onClick={() => this.togglePicturesFullSizeMode()}
            className={
              imageSizeMode === ImageSizeMode.fullSize ? "selected" : ""
            }
          >
            <PhotoSizeSelectActualIcon />
          </Button>
          <Auth role="UPLOAD">
            <Button
              title="Upload files"
              onClick={() => this.onUploadFilesClick()}
            >
              <CloudUploadIcon />
            </Button>
            <Button
              title="Create new folder"
              onClick={() => this.onCreateNewFolderClick()}
            >
              <CreateNewFolderIcon />
            </Button>
            <Button
              title="Album settings"
              onClick={() => this.onSettingsClick()}
            >
              <SettingsIcon />
            </Button>
            <Button
              title="Delete items"
              onClick={() => this.onDeleteClick()}
              disabled={selectedNodes.length === 0}
            >
              <DeleteIcon />
            </Button>
            <Button
              title="Rename selected node"
              onClick={() => this.onRenameClick()}
              disabled={selectedNodes.length !== 1}
            >
              <DescriptionIcon />
            </Button>
          </Auth>
        </div>
        <NodePath albumId={albumId} folderId={folderId} services={services} />
        <div className="folder-view">
          {viewType === FoldersPageView.table && (
            <FolderTable
              auth={auth}
              albumId={albumId}
              nodes={nodes}
              onSelectNode={this.onSelectNode.bind(this)}
              onDoubleClick={this.onDoubleClick.bind(this)}
              onImageClick={this.onImageClick.bind(this)}
              selectedNodes={selectedNodes}
              cutNodes={cutNodes}
            />
          )}
          {viewType === FoldersPageView.gallery && (
            <FolderGallery
              auth={auth}
              albumId={albumId}
              nodes={nodes}
              onSelectNode={this.onSelectNode.bind(this)}
              onDoubleClick={this.onDoubleClick.bind(this)}
              onImageClick={this.onImageClick.bind(this)}
              selectedNodes={selectedNodes}
            />
          )}
        </div>
        <ConfirmDialog {...confirm} />
        <PhotoSwipe id={this._galleryElementId} />
      </div>
    );
  }
}
