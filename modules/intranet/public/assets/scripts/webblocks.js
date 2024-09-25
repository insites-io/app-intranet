const searchInput = document.getElementById('search-input');

// Scroll to top
const blocksScrollElement = document.getElementById('scroll-to-top-btn');
const blocksScrollTopBtn = document.getElementById('scroll-to-top');

// Mobile Menu
const blocksMobileMenuBtn = document.getElementById('mobile-menu-btn')
const blocksMobileMenuDrawer = document.getElementById('mobile-menu');

let blocksLastKnownScrollPosition = window.pageYOffset || document.body.scrollTop;
let initialBlocksLastKnownScrollPosition = blocksLastKnownScrollPosition;
const mobileWindowWidthLimit = 1023;

let firstLoad = true;
let scrollValues = [];

// MAIN JS
let WebBlocks = (function () {
  return {
    // data manipulation
    data: {
      formatDatePayload(date, format) {
        let formatted = "";
        if (date) {
          let currentFormat = format || this.datetimeFormat;
          let meridiem = moment(date, currentFormat).format('YYYY-MM-DD HH:mm');
          formatted = moment(meridiem, 'YYYY-MM-DD HH:mm').utc().format('YYYY-MM-DD HH:mm');
        }
        return formatted;
      },
      setNow() {
        return this.formatDatePayload(moment().format('YYYY-MM-DD HH:mm'), 'YYYY-MM-DD HH:mm');
      },
      constructImage(file) {
        let imageRegex = /\(gif|jpg|jpeg|tiff|png\)$/i;
        let type = file.image.url.split(".");
        type = type[type.length - 1].split("?")[0];
        let filename = file.image.url.split("/")
        filename = filename[filename.length - 1];
        let data = {
          id: file.id,
          name: filename,
          type: imageRegex.test(type) ? `image/${type}` : `application/${type}`,
          url: file.image.url
        }
        return data;
      },
      stringifyBoolean(data) {
        let text = ""
        if (data === true || data === 'true') {
          text = "Yes"
        } else if (data === false || data === 'false') {
          text = "No"
        }
        return text;
      },
      capitalize(item) {
        return item.split("_").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
      },
      convertToSnakeCase(name) {
        return name
          ? InsitesUtil.removeWhitespace(name).trim().replace(/[ -]/g, "_").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
          : '';
      },
      convertToKebabCase(text) {
        let kebab = text
          ? text.trim().replace(/[ ]/g, "-").replace(/[_]/g, "")
          : '';
        return InsitesUtil.removeWhitespace(kebab);
      },
      getFillerHeight() {
        /* Get the width of the window to check if it will get the height of the filler for the mobile or desktop then return it. */
        let windowWidth = window.innerWidth;
        let fillerContainer = document.getElementById("head-filler");
        let fillerHeight = 0;
        //clientHeight includes the padding only
        if (windowWidth <= mobileWindowWidthLimit) {
          fillerHeight = fillerContainer.getElementsByClassName("mobile")[0].clientHeight;
          //console.log("Inner Height Used: ", fillerContainer.getElementsByClassName("mobile")[0].clientHeight);
        } else {
          fillerHeight = fillerContainer.getElementsByClassName("desktop")[0].clientHeight;
          //console.log("Inner Height Used: ", fillerContainer.getElementsByClassName("desktop")[0].clientHeight);
        }
        return fillerHeight;
      }
    },
    // Validation functions
    validation: {
      validateForm(containerEl) {
        for (let index = 0; index < containerEl.querySelectorAll('[validate]').length; index++) {
          let field = containerEl.querySelectorAll('[validate]')[index];
          let type = field.tagName.toLowerCase();
          switch (type) {
            case 'div':
              this.validateRadio(field);
              break;
            case 'ins-input-file':
              this.validateFile(field);
              break;
            case 'ins-textarea':
              this.validateInput(field.querySelector('textarea'));
              break
            case 'ins-input':
            default:
              field.field === 'email'
                ? this.validateEmail(field)
                : this.validateInput(field)
              break;
          }
        }
        return this.checkInvalidFields(containerEl);
      },
      checkRecaptcha() {
        let isValid = formEl.querySelector('#g-recaptcha-response').value.trim() !== ''
          ? true : false;
        isValid
          ? document.getElementById('recaptcha-v2-wrapper').removeAttribute('has-error')
          : document.getElementById('recaptcha-v2-wrapper').setAttribute('has-error', true);
        return isValid;
      },
      checkInvalidFields(containerEl) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(!containerEl.querySelectorAll('.is-invalid').length);
          }, 200)
        });
      },
      validateTabs(tabEl) {
        for (let i = 0; i < tabEl.querySelectorAll('ins-tab-item').length; i++) {
          let fields = tabEl.querySfieldelectorAll('ins-tab-item')[i];
          fields.hasError = fields.querySelectorAll('.is-invalid').length ?
            true :
            false;
        }
        return !tabEl.querySelectorAll('.is-invalid').length;
      },
      validateFile(field) {
        field.getFilesList().length <= 0 ?
          field.setAttribute('has-error', true) :
          field.removeAttribute('has-error')
      },
      validateRadio(wrapper) {
        wrapper.querySelectorAll('ins-radio input:checked').length ?
          wrapper.classList.remove('is-invalid') :
          wrapper.classList.add('is-invalid');
      },
      validateEmail(field) {
        let isEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (field.value) {
          if (isEmail.test(String(field.value).toLowerCase()) === true) {
            InsitesUtil.validFieldNotif(field);
            return true;
          } else {
            InsitesUtil.invalidFieldNotif(field);
            return false;
          }
        }
        InsitesUtil.invalidFieldNotif(field);
        return false;
      },
      validateInput(field) {
        field = field.target ? field.target : field;
        if (!field.value) {
          InsitesUtil.invalidFieldNotif(field);
          return true;
        } else {
          InsitesUtil.validFieldNotif(field);
          return false;
        }
      }
    },
    // Events 
    events: {
      toastIt(type, message, timeout) {
        var opt = typeof timeout === "string" ? timeout : undefined;
        window.toastr.options = {
          "closeButton": true,
          "debug": false,
          "newestOnTop": true,
          "progressBar": opt ? true : false,
          "positionClass": "toast-top-right",
          "preventDuplicates": false,
          "onclick": null,
          "showDuration": "300",
          "hideDuration": "1000",
          "timeOut": opt || "5000",
          "extendedTimeOut": "5000",
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut"
        }
        window.toastr[type](message);
      },
      // App.events.notyf('error', "Error message here");
      // App.events.notyf('success', "Success message here");
      notyf(type, message) {
        new Notyf({
          duration: 3000,
          position: {
            x: 'right',
            y: 'top'
          }
        })[type](message);
      },
      async swal(type, message, showCancel = true) {
        let label = WebBlocks.data.capitalize(type);
        return await new Promise(resolve => {
          Swal.fire({
            title: "",
            html: `
                        <ins-loader
                            state-icon="warning"
                            icon-color="warning"
                            state-message="${message}">
                        </ins-loader>`,
            width: 330,
            showCancelButton: showCancel,
            customClass: {
              confirmButton:
                label.indexOf("Delete") >= 0 ||
                  label.indexOf("Archive") >= 0 ||
                  label.indexOf("Disable") >= 0 ||
                  label.indexOf("Remove") >= 0
                  ? "negative" : "",
            },
            confirmButtonText: label
          }).then(result => {
            result.value
              ? resolve(true)
              : resolve(false);
          });
        });
      },
      // Scroll to top show / hide buton
      initWindowOnScroll() {
        let vh = window.innerHeight + 100;
        window.onscroll = () => {
          if (window.pageYOffset > vh) {
            blocksScrollElement.classList.add('visible');
          } else {
            blocksScrollElement.classList.remove('visible');
          }
        };
      },
      toggleDrawerMenu() {
        let state = !blocksMobileMenuDrawer.isOpen ? true : false;
        blocksMobileMenuDrawer.setDrawerState(state);
        this.toggleMobileMenuBtnIcon(state);
      },
      toggleMobileMenuBtnIcon(state) {
        let setIcon = !state
          ? 'icon-menu-1'
          : 'icon-close-1';
        blocksMobileMenuBtn.removeAttribute('class');
        blocksMobileMenuBtn.classList.add(setIcon);
      },

      initialScrollPosition() {
        
        let position_y = window.scrollY;
        let mainHeader = document.getElementById('main-header');
        
        console.log('position_y: ', position_y);
        console.log('filler: ', WebBlocks.data.getFillerHeight());

        if(position_y > WebBlocks.data.getFillerHeight()) {
          mainHeader.style.transform = "translate3d(0px, -133px, 0px)";
        }

      },

      checkScrollStatus(scrollPosition) {
        
        let mainHeader = document.getElementById('main-header');
        let fillerGuide = WebBlocks.data.getFillerHeight();

        //Check if guide is breached before initiating animation
        if (scrollPosition > fillerGuide) {
          if (scrollPosition <= blocksLastKnownScrollPosition) {
            mainHeader.style.transform = "translate3d(0px, 0px, 0px)";
            //show Menu
          } else {
            //hide Menu
            mainHeader.style.transform = "translate3d(0px, -133px, 0px)";
          }
        } else {
          //If less than the Guide put back Header to initial looks
          mainHeader.style.transform = "translate3d(0px, 0px, 0px)";
        }
        blocksLastKnownScrollPosition = scrollPosition;
      }
    },
    // Initialize elements & event listeners
    init: {
      // Scroll to top event
      initScrollToTopBtn() {
        if (blocksScrollTopBtn) {
          WebBlocks.events.initWindowOnScroll();

          blocksScrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          });
        }
      },
      // Mobile Menu
      initMobileMenu() {
        if (blocksMobileMenuBtn && blocksMobileMenuDrawer) {
          blocksMobileMenuBtn.addEventListener('click', () => {
            WebBlocks.events.toggleDrawerMenu();
          });
          blocksMobileMenuDrawer.addEventListener('toggleDrawer', () => {
            WebBlocks.events.toggleMobileMenuBtnIcon();
          });
        }
      },
      // Scrolling Event for Menu
      initScrollMenu() {
        let mainHeader = document.getElementById('main-header');
        let ticking = false;
    
        if (mainHeader) {

          WebBlocks.events.initialScrollPosition();
          //WebBlocks.events.checkScrollStatus(window.scrollY);

          document.addEventListener('scroll', function (e) {
            //this is done to avoid throtling the function too much
            if (!ticking) {
              window.requestAnimationFrame(function () {
                //console.log("Scroll Y:", window.scrollY);
                WebBlocks.events.checkScrollStatus(window.scrollY);
                ticking = false;
              });
              ticking = true;
            }
          });

        }
      },
      initSearch() {
        if (searchInput) {
          searchInput.addEventListener('insInput', searchHandler);
          searchInput.addEventListener('insIconClick', event => searchHandler(event, true))
        }
      
        function searchHandler(event, click = false) {
          if ((event.detail.keyCode === 13 && event.detail.value !== "") ||
            (click && event.detail.value !== "")) {
            window.location = `/search?keyword=${encodeURIComponent(event.detail.value)}`;
          } else if (event.detail.value == "") {
            window.location = `/`;
          }
        }
      }
    }
  }
})();

// Initialize javascript on load
window.WebBlocks = WebBlocks;
window.onload = function(e){ 
  // Set timeout, make sure INS components has been loaded
  setTimeout(() => {
    WebBlocks.init.initScrollToTopBtn();
    WebBlocks.init.initMobileMenu();
    WebBlocks.init.initScrollMenu();
    WebBlocks.init.initSearch();
  }, 200);
  console.log('loaded.');
}

